from rest_framework import serializers
from .models import Review
from apps.bookings.models import Booking

class ReviewSerializer(serializers.ModelSerializer):
    """
    Базовый сериализатор для просмотра отзывов
    """
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)
    cottage_name = serializers.CharField(source='cottage.name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_name', 'user_first_name', 'user_avatar', 'cottage', 'cottage_name',
            'rating', 'comment', 'is_approved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'is_approved', 'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания отзыва
    """
    class Meta:
        model = Review
        fields = ['rating', 'comment']
    
    def create(self, validated_data):
        """Создание отзыва с автозаполнением пользователя"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        validated_data['is_approved'] = False  # По умолчанию не одобрен
        
        return super().create(validated_data)


class ReviewModerateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модерации отзывов (только для админов)
    """
    class Meta:
        model = Review
        fields = ['is_approved']