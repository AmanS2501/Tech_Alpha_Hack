from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MedicineViewSet,
    ManufacturerViewSet,
    ProductionBatchViewSet,
    LocationViewSet,
    InventoryViewSet,
    ResupplyRequestViewSet,
    StockMovementViewSet,
    DemandForecastViewSet
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

urlpatterns = [
    path('', include(router.urls)),
]