# pagodas/serializers.py
from rest_framework import serializers
from .models import Pagoda, SavedLocation

class PagodaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagoda
        fields = '__all__'

# Serializer for SavedLocation
from .models import Pagoda

class SavedLocationSerializer(serializers.ModelSerializer):
    pagoda = PagodaSerializer(read_only=True)

    class Meta:
        model = SavedLocation
        fields = '__all__'
        
