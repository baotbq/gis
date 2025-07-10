from rest_framework.routers import DefaultRouter
from .views import PagodaViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'pagodas', PagodaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
