from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Medicine, Manufacturer, ProductionBatch, Location, Inventory, StockMovement, ResupplyRequest, DemandForecast, UserProfile

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        if hasattr(user, 'profile'):
            token['role'] = user.profile.role
            token['organization'] = user.profile.organization
        token['username'] = user.username
        token['email'] = user.email
        
        return token

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'organization', 'phone']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    profile = UserProfileSerializer(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 'last_name', 'profile']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        validated_data.pop('password2')
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        user.set_password(validated_data['password'])
        user.save()
        
        UserProfile.objects.create(
            user=user,
            role=profile_data['role'],
            organization=profile_data.get('organization', ''),
            phone=profile_data.get('phone', '')
        )
        
        return user

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = '__all__'

class ProductionBatchSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    days_to_expiry = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductionBatch
        fields = '__all__'
    
    def get_days_to_expiry(self, obj):
        from django.utils import timezone
        from datetime import datetime
        today = timezone.now().date()
        return (obj.expiry_date - today).days

class LocationSerializer(serializers.ModelSerializer):
    inventory_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = '__all__'
    
    def get_inventory_count(self, obj):
        return Inventory.objects.filter(location=obj).count()

class InventorySerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='batch.medicine.name', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    expiry_date = serializers.DateField(source='batch.expiry_date', read_only=True)
    days_to_expiry = serializers.SerializerMethodField()
    
    class Meta:
        model = Inventory
        fields = '__all__'
    
    def get_days_to_expiry(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return (obj.batch.expiry_date - today).days

class StockMovementSerializer(serializers.ModelSerializer):
    from_location_name = serializers.CharField(source='from_location.name', read_only=True, allow_null=True)
    to_location_name = serializers.CharField(source='to_location.name', read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    medicine_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StockMovement
        fields = '__all__'
    
    def get_medicine_name(self, obj):
        if obj.inventory and obj.inventory.batch:
            return obj.inventory.batch.medicine.name
        return None

class ResupplyRequestSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    location_name = serializers.CharField(source='requesting_location.name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.username', read_only=True)
    days_since_request = serializers.SerializerMethodField()
    
    class Meta:
        model = ResupplyRequest
        fields = '__all__'
    
    def get_days_since_request(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return (today - obj.created_at.date()).days

class DemandForecastSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    days_until_forecast = serializers.SerializerMethodField()
    
    class Meta:
        model = DemandForecast
        fields = '__all__'
    
    def get_days_until_forecast(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return (obj.forecast_date - today).days