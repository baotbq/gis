from django.db import models



from django.contrib.auth.models import User

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
    opening_hours = models.CharField(max_length=100, blank=True, verbose_name="Giờ mở cửa")
    target_audience = models.CharField(max_length=50, blank=True, verbose_name="Đối tượng phục vụ")  # người thường, sư, nico
    sect = models.CharField(max_length=50, blank=True, verbose_name="Trường phái")  # Tịnh Độ, Đại thừa, ...
    transportation = models.CharField(max_length=100, blank=True, verbose_name="Phương tiện di chuyển")
    events = models.TextField(blank=True, verbose_name="Sự kiện/lễ lớn")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# Model to store saved pagoda locations for users
class SavedLocation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pagoda = models.ForeignKey(Pagoda, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'pagoda')
    def __str__(self):
        return f"{self.user.username} saved {self.pagoda.name}"
