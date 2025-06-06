from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json

class Medicine(models.Model):
    name = models.CharField(max_length=255)
    strength = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} {self.strength}"

class Manufacturer(models.Model):
    name = models.CharField(max_length=255)
    contact_info = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ProductionBatch(models.Model):
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    batch_number = models.CharField(max_length=100, unique=True)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE)
    production_date = models.DateField()
    expiry_date = models.DateField()
    quantity = models.IntegerField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.batch_number} - {self.medicine.name}"

class Location(models.Model):
    name = models.CharField(max_length=255)
    location_type = models.CharField(max_length=50, choices=[
        ('warehouse', 'Warehouse'),
        ('pharmacy', 'Pharmacy'),
        ('hospital', 'Hospital'),
        ('shelf', 'Shelf'),
        ('cold_storage', 'Cold Storage')
    ])
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Inventory(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('low_stock', 'Low Stock'),
        ('awaiting_distribution', 'Awaiting Distribution'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('expired', 'Expired')
    ]
    
    batch = models.ForeignKey(ProductionBatch, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='available')
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['batch', 'location']

    def __str__(self):
        return f"{self.batch.medicine.name} at {self.location.name}"

class StockMovement(models.Model):
    MOVEMENT_TYPE_CHOICES = [
        ('production', 'Production'),
        ('distribution', 'Distribution'),
        ('transfer', 'Transfer'),
        ('adjustment', 'Adjustment'),
        ('disposal', 'Disposal')
    ]
    
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=50, choices=MOVEMENT_TYPE_CHOICES)
    quantity_change = models.IntegerField()
    from_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='outgoing_movements', null=True, blank=True)
    to_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='incoming_movements', null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

class ResupplyRequest(models.Model):
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('critical', 'Critical')
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected')
    ]
    
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    requesting_location = models.ForeignKey(Location, on_delete=models.CASCADE)
    requested_quantity = models.IntegerField()
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='normal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class DemandForecast(models.Model):
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    forecast_date = models.DateField()
    predicted_demand = models.IntegerField()
    confidence_level = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['medicine', 'location', 'forecast_date']