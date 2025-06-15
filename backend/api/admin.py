from django.contrib import admin
from .models import Medicine, Manufacturer, ProductionBatch, Location, Inventory, ResupplyRequest, StockMovement, DemandForecast, UserProfile

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'strength', 'created_at']
    search_fields = ['name', 'strength']

@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

@admin.register(ProductionBatch)
class ProductionBatchAdmin(admin.ModelAdmin):
    list_display = ['batch_number', 'medicine', 'manufacturer', 'production_date', 'quantity']
    list_filter = ['manufacturer', 'production_date']
    search_fields = ['batch_number', 'medicine__name']

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'location_type', 'created_at']
    list_filter = ['location_type']
    search_fields = ['name']

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ['batch', 'location', 'quantity', 'status', 'last_updated']
    list_filter = ['status', 'location']
    search_fields = ['batch__batch_number', 'batch__medicine__name']

@admin.register(ResupplyRequest)
class ResupplyRequestAdmin(admin.ModelAdmin):
    list_display = ['medicine', 'requesting_location', 'requested_quantity', 'urgency', 'status', 'created_at']
    list_filter = ['urgency', 'status', 'created_at']
    search_fields = ['medicine__name', 'requesting_location__name']