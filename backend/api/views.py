from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import json

from .models import Medicine, Manufacturer, ProductionBatch, Location, Inventory, StockMovement, ResupplyRequest, DemandForecast
from .serializers import MedicineSerializer, ManufacturerSerializer, ProductionBatchSerializer, LocationSerializer, InventorySerializer, ResupplyRequestSerializer, StockMovementSerializer, DemandForecastSerializer

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

class DemandForecastViewSet(viewsets.ModelViewSet):
    queryset = DemandForecast.objects.all()
    serializer_class = DemandForecastSerializer

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