from django.shortcuts import render
from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import json
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from .ai.forecasting import generate_forecast_from_csv

from .models import Medicine, Manufacturer, ProductionBatch, Location, Inventory, StockMovement, ResupplyRequest, DemandForecast
from .serializers import MedicineSerializer, ManufacturerSerializer, ProductionBatchSerializer, LocationSerializer, InventorySerializer, ResupplyRequestSerializer, StockMovementSerializer, DemandForecastSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .serializers import UserSerializer, RegisterSerializer, MyTokenObtainPairSerializer
from .permissions import IsManufacturer, IsStockist, IsPharmacist, IsManufacturerOrStockist, IsStockistOrPharmacist
from .models import UserProfile

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

class ManufacturerViewSet(viewsets.ModelViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer

class ProductionBatchViewSet(viewsets.ModelViewSet):
    queryset = ProductionBatch.objects.all()
    serializer_class = ProductionBatchSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        batch = serializer.save()
        
        StockMovement.objects.create(
            inventory=None,
            movement_type='production',
            quantity_change=batch.quantity,
            to_location_id=request.data.get('initial_location'),
            notes=f"Initial production batch {batch.batch_number}",
            created_by=request.user
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        total_medicines = Medicine.objects.count()
        low_stock_count = Inventory.objects.filter(
            Q(quantity__lt=100) | Q(status='low_stock')
        ).count()
        in_transit_count = Inventory.objects.filter(status='in_transit').count()
        
        recent_activity = StockMovement.objects.select_related(
            'inventory__batch__medicine', 'from_location', 'to_location'
        ).order_by('-created_at')[:10]
        
        activity_data = []
        for movement in recent_activity:
            activity_data.append({
                'timestamp': movement.created_at.strftime('%Y-%m-%d %H:%M'),
                'event': movement.movement_type.replace('_', ' ').title(),
                'medicine': movement.inventory.batch.medicine.name if movement.inventory else 'N/A',
                'details': f"{abs(movement.quantity_change)} units",
                'location': movement.to_location.name if movement.to_location else movement.from_location.name
            })
        
        return Response({
            'medicines_in_system': total_medicines,
            'low_stock_alerts': low_stock_count,
            'items_in_transit': in_transit_count,
            'forecast_accuracy': 92.5,
            'recent_activity': activity_data
        })

    @action(detail=False, methods=['get'])
    def low_stock_alerts(self, request):
        low_stock_items = Inventory.objects.filter(
            Q(quantity__lt=100) | Q(status='low_stock')
        ).select_related('batch__medicine', 'location')
        
        alerts = []
        for item in low_stock_items:
            alerts.append({
                'medicine': item.batch.medicine.name,
                'location': item.location.name,
                'current_stock': item.quantity,
                'batch_number': item.batch.batch_number,
                'status': item.status
            })
        
        return Response(alerts)

    @action(detail=False, methods=['post'])
    def update_stock(self, request):
        batch_number = request.data.get('batch_number')
        location_name = request.data.get('location')
        new_quantity = request.data.get('quantity')
        
        try:
            batch = ProductionBatch.objects.get(batch_number=batch_number)
            location = Location.objects.get(name=location_name)
            inventory, created = Inventory.objects.get_or_create(
                batch=batch,
                location=location,
                defaults={'quantity': new_quantity}
            )
            
            if not created:
                old_quantity = inventory.quantity
                inventory.quantity = new_quantity
                inventory.save()
                
                StockMovement.objects.create(
                    inventory=inventory,
                    movement_type='adjustment',
                    quantity_change=new_quantity - old_quantity,
                    notes="Manual stock update",
                    created_by=request.user
                )
            
            return Response({'success': True})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ResupplyRequestViewSet(viewsets.ModelViewSet):
    queryset = ResupplyRequest.objects.all()
    serializer_class = ResupplyRequestSerializer

    def create(self, request, *args, **kwargs):
        request.data['requested_by'] = request.user.id
        return super().create(request, *args, **kwargs)

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    
    @action(detail=False, methods=['post'])
    def transfer_stock(self, request):
        """Transfer stock between locations"""
        from_location_id = request.data.get('from_location')
        to_location_id = request.data.get('to_location')
        batch_id = request.data.get('batch')
        quantity = int(request.data.get('quantity', 0))
        notes = request.data.get('notes', '')
        
        if quantity <= 0:
            return Response({'error': 'Quantity must be positive'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            source_inventory = Inventory.objects.get(location_id=from_location_id, batch_id=batch_id)
            
            if source_inventory.quantity < quantity:
                return Response({'error': 'Not enough stock available'}, status=status.HTTP_400_BAD_REQUEST)
            
            source_inventory.quantity -= quantity
            source_inventory.save()
            
            dest_inventory, created = Inventory.objects.get_or_create(
                location_id=to_location_id,
                batch_id=batch_id,
                defaults={'quantity': 0, 'status': 'available'}
            )
            
            dest_inventory.quantity += quantity
            dest_inventory.save()
            
            movement = StockMovement.objects.create(
                inventory=source_inventory,
                movement_type='transfer',
                quantity_change=-quantity,
                from_location_id=from_location_id,
                to_location_id=to_location_id,
                notes=notes,
                created_by=request.user
            )
            
            return Response({
                'success': True,
                'message': f'Successfully transferred {quantity} units',
                'movement_id': movement.id
            })
            
        except Inventory.DoesNotExist:
            return Response({'error': 'Source inventory not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def movement_history(self, request):
        """Get movement history for a specific batch or location"""
        batch_id = request.query_params.get('batch')
        location_id = request.query_params.get('location')
        days = int(request.query_params.get('days', 30))
        
        from django.utils import timezone
        from datetime import timedelta
        start_date = timezone.now() - timedelta(days=days)
        
        queryset = StockMovement.objects.filter(created_at__gte=start_date)
        
        if batch_id:
            queryset = queryset.filter(inventory__batch_id=batch_id)
        
        if location_id:
            queryset = queryset.filter(
                models.Q(from_location_id=location_id) | 
                models.Q(to_location_id=location_id)
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class DemandForecastViewSet(viewsets.ModelViewSet):
    queryset = DemandForecast.objects.all()
    serializer_class = DemandForecastSerializer
    parser_classes = [MultiPartParser]

    @action(detail=False, methods=['post'])
    def generate_forecast(self, request):
        historical_data = request.data.get('historical_data', [])
        current_stock = request.data.get('current_stock', [])
        
        forecasts = []
        for stock_item in current_stock:
            location_name = stock_item.get('pharmacy')
            medicine_name = stock_item.get('medicine')
            current_qty = stock_item.get('stock', 0)
            
            demand_prediction = self._calculate_demand(historical_data, medicine_name, location_name)
            forecasts.append({
                'location': location_name,
                'medicine': medicine_name,
                'current_stock': current_qty,
                'predicted_demand': demand_prediction,
                'recommendation': 'reorder' if current_qty < demand_prediction else 'sufficient'
            })
        
        return Response({'forecasts': forecasts})
    
    @action(detail=False, methods=['post'])
    def upload_csv_forecast(self, request):
        file = request.FILES.get('file')
        medicine_id = request.data.get('medicine_id')
        location_id = request.data.get('location_id')

        if not file:
            return Response({'error': 'No CSV file uploaded'}, status=400)

        try:
            csv_content = file.read().decode('utf-8')
            forecasted_data = generate_forecast_from_csv(csv_content)

            # Save predictions to database
            saved = []
            for row in forecasted_data:
                obj, created = DemandForecast.objects.update_or_create(
                    medicine_id=medicine_id,
                    location_id=location_id,
                    forecast_date=row['ds'],
                    defaults={
                        'predicted_demand': row['yhat'],
                        'confidence_level': 0.95
                    }
                )
                saved.append({
                    'date': row['ds'],
                    'predicted_demand': row['yhat']
                })

            return Response({'forecast': saved})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def _calculate_demand(self, historical_data, medicine, location):
        relevant_data = [
            item for item in historical_data 
            if item.get('medicine') == medicine and item.get('region') in location
        ]
        if relevant_data:
            avg_demand = sum(item.get('demand', 0) for item in relevant_data) / len(relevant_data)
            return int(avg_demand * 1.2)
        return 50

    @action(detail=False, methods=['post'])
    def redirection_suggestions(self, request):
        current_stock = request.data.get('current_stock', {})
        demand_forecasts = request.data.get('demand_forecasts', {})
        threshold = float(request.data.get('threshold', 0.2))
        
        suggestions = []
        for location, stock_data in current_stock.items():
            for medicine, quantity in stock_data.items():
                demand = demand_forecasts.get(location, {}).get(medicine, 0)
                
                if demand > 0:
                    ratio = quantity / demand
                    if ratio > (1 + threshold):
                        surplus = quantity - demand
                        
                        for other_location, other_stock in current_stock.items():
                            if other_location != location:
                                other_demand = demand_forecasts.get(other_location, {}).get(medicine, 0)
                                other_quantity = other_stock.get(medicine, 0)
                                
                                if other_demand > 0 and (other_quantity / other_demand) < (1 - threshold):
                                    need = other_demand - other_quantity
                                    transfer_amount = min(surplus, need)
                                    
                                    suggestions.append({
                                        'from_location': location,
                                        'to_location': other_location,
                                        'medicine': medicine,
                                        'suggested_quantity': transfer_amount,
                                        'reason': f"Surplus at {location}, shortage at {other_location}"
                                    })
                                    break
        
        return Response({'suggestions': suggestions})

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search inventory by medicine name, batch number, or location"""
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        results = Inventory.objects.filter(
            models.Q(batch__medicine__name__icontains=query) |
            models.Q(batch__batch_number__icontains=query) |
            models.Q(location__name__icontains=query)
        ).select_related('batch__medicine', 'location')
        
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get inventory items that are expiring soon"""
        days = int(request.query_params.get('days', 90))
        
        from django.utils import timezone
        from datetime import timedelta
        expiry_threshold = timezone.now().date() + timedelta(days=days)
        
        expiring_items = Inventory.objects.filter(
            batch__expiry_date__lte=expiry_threshold,
            batch__expiry_date__gte=timezone.now().date(),
            quantity__gt=0
        ).select_related('batch__medicine', 'location')
        
        items = []
        for item in expiring_items:
            days_left = (item.batch.expiry_date - timezone.now().date()).days
            items.append({
                'id': item.id,
                'medicine': item.batch.medicine.name,
                'batch_number': item.batch.batch_number,
                'location': item.location.name,
                'quantity': item.quantity,
                'expiry_date': item.batch.expiry_date,
                'days_left': days_left,
                'status': 'critical' if days_left < 30 else 'warning'
            })
        
        items.sort(key=lambda x: x['days_left'])
        
        return Response(items)