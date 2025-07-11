from django.shortcuts import render

# Create your views here.
# pagodas/views.py
from rest_framework import viewsets, filters
from .models import Pagoda
from .serializers import PagodaSerializer

class PagodaViewSet(viewsets.ModelViewSet):
    queryset = Pagoda.objects.all()
    serializer_class = PagodaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
