from rest_framework.routers import DefaultRouter
from .views import PagodaViewSet
from .views_auth import LoginView, CheckUserInfoView, SaveLocationView, SavedLocationListView
from django.urls import path, include

router = DefaultRouter()
router.register(r'pagodas', PagodaViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('check_user_info/', CheckUserInfoView.as_view(), name='check_user_info'),
    path('save_location/', SaveLocationView.as_view(), name='save_location'),
    path('saved_locations/', SavedLocationListView.as_view(), name='saved_locations'),
    path('', include(router.urls)),
]
