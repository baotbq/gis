from django.db import models



# Create your models here.
class Pagoda(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    province = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    ward = models.CharField(max_length=100)
    address_detail = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    class FavoritePagoda(models.Model):
        user = models.ForeignKey(User, on_delete=models.CASCADE)
        pagoda = models.ForeignKey(pagoda, on_delete=models.CASCADE)
        created_at = models.DateTimeField(auto_now_add=True)
