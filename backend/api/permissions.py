from rest_framework import permissions

class IsManufacturer(permissions.BasePermission):
    """Allow access only to manufacturer users."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'manufacturer'

class IsStockist(permissions.BasePermission):
    """Allow access only to stockist users."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'stockist'

class IsPharmacist(permissions.BasePermission):
    """Allow access only to pharmacist users."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'pharmacist'

class IsManufacturerOrStockist(permissions.BasePermission):
    """Allow access to manufacturer or stockist users."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated or not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ['manufacturer', 'stockist']

class IsStockistOrPharmacist(permissions.BasePermission):
    """Allow access to stockist or pharmacist users."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated or not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ['stockist', 'pharmacist']