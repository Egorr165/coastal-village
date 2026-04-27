from rest_framework import serializers
from .models import Cottage, CottageImage


class CottageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CottageImage
        fields = ['id', 'image', 'is_main']

class CottageSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='house_type', read_only=True)
    pricePerNight = serializers.DecimalField(source='price_per_night', max_digits=10, decimal_places=2, read_only=True)
    bookedRanges = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    
    class Meta:
        model = Cottage
        fields = [
            'id', 'type', 'title', 'capacity', 'pricePerNight',
            'area', 'bedrooms',
            'images', 'bookedRanges'
        ]
    
    def get_bookedRanges(self, obj):
        from apps.bookings.models import Booking
        active_bookings = obj.bookings.exclude(status__in=[Booking.StatusChoices.CANCELLED, Booking.StatusChoices.COMPLETED])
        return [
            {
                'startDate': b.check_in_date.isoformat(),
                'endDate': b.check_out_date.isoformat()
            } for b in active_bookings
        ]
    
    def get_images(self, obj):
        request = self.context.get('request')
        result = []
        # Получаем картинки по типу домика
        images = list(CottageImage.objects.filter(house_type=obj.house_type))
        images.sort(key=lambda img: img.is_main, reverse=True)
        
        for img in images:
            if img.image:
                url = img.image.url
                if request:
                    url = request.build_absolute_uri(url)
                result.append(url)
        return result



class CottageListSerializer(CottageSerializer):
    pass

class CottageDetailSerializer(CottageSerializer):
    pass