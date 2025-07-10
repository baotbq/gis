# pagodas/serializers.py
from rest_framework import serializers
from .models import Pagoda

class PagodaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagoda
        fields = '__all__'
        
