from rest_framework import serializers
from .models import Booking
from datetime import date

class BookingSerializer(serializers.ModelSerializer):
    """
    Базовый сериализатор для просмотра бронирований
    """
    user_name = serializers.CharField(source='user.username', read_only=True)
    cottage_name = serializers.CharField(source='cottage.title', read_only=True)
    nights_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_name', 'cottage', 'cottage_name',
            'check_in_date', 'check_out_date', 'nights_count',
            'guests_count', 'extra_bed_count', 'total_price', 'status', 'special_requests',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at', 'total_price']
    
    def get_nights_count(self, obj):
        return obj.get_nights_count()


class BookingCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания нового бронирования
    """
    class Meta:
        model = Booking
        fields = [
            'cottage', 'check_in_date', 'check_out_date',
            'guests_count', 'extra_bed_count', 'special_requests'
        ]
    
    def validate_check_in_date(self, value):
        """Проверка даты заезда"""
        if value < date.today():
            raise serializers.ValidationError('Дата заезда не может быть в прошлом')
        return value
    
    def validate(self, data):
        """Общая валидация"""
        check_in = data.get('check_in_date')
        check_out = data.get('check_out_date')
        cottage = data.get('cottage')
        guests = data.get('guests_count', 1)
        
        # Проверка что выезд после заезда
        if check_in and check_out and check_in >= check_out:
            raise serializers.ValidationError('Дата выезда должна быть позже даты заезда')
        
        # Проверка вместимости
        if cottage and guests > cottage.capacity:
            raise serializers.ValidationError(
                f'Максимальная вместимость домика: {cottage.capacity} человек'
            )
        
        # Проверка доступности домика
        if cottage and check_in and check_out:
            conflicting = Booking.objects.filter(
                cottage=cottage,
                status__in=['pending', 'confirmed'],
                check_in_date__lt=check_out,
                check_out_date__gt=check_in
            )
            if conflicting.exists():
                raise serializers.ValidationError('Домик уже забронирован на эти даты')
        
        return data
    
    def create(self, validated_data):
        """Создание бронирования с автозаполнением"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        validated_data['status'] = Booking.StatusChoices.PENDING
        
        # Расчет стоимости
        cottage = validated_data['cottage']
        nights = (validated_data['check_out_date'] - validated_data['check_in_date']).days
        extra_beds = validated_data.get('extra_bed_count', 0)
        
        base_price = cottage.price_per_night * nights
        extras_price = 1500 * nights * extra_beds
        validated_data['total_price'] = base_price + extras_price
        
        return super().create(validated_data)


class BookingUpdateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для обновления статуса бронирования
    """
    class Meta:
        model = Booking
        fields = ['status']