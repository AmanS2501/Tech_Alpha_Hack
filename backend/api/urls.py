from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    MedicineViewSet,
    ManufacturerViewSet,
    ProductionBatchViewSet,
    LocationViewSet,
    InventoryViewSet,
    ResupplyRequestViewSet,
    StockMovementViewSet,
    DemandForecastViewSet,
    UserViewSet,
    MyTokenObtainPairView,
    RegisterView
)

router = DefaultRouter()
router.register(r'medicines', MedicineViewSet)
router.register(r'manufacturers', ManufacturerViewSet)
router.register(r'production-batches', ProductionBatchViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'resupply-requests', ResupplyRequestViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'demand-forecasts', DemandForecastViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
]