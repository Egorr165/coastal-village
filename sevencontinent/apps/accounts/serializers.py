from rest_framework import serializers
from django.db.models import Q
from .models import User
import uuid

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(source='first_name', required=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email уже используется")
        return value

    def create(self, validated_data):
        validated_data['username'] = uuid.uuid4().hex[:30]
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        identifier = data.get('identifier')
        password = data.get('password')

        if identifier and password:
            user = User.objects.filter(Q(email=identifier) | Q(phone=identifier)).first()
            if not user or not user.check_password(password):
                raise serializers.ValidationError("Неверный email, телефон или пароль")
            if not user.is_active:
                raise serializers.ValidationError("Пользователь деактивирован")
        else:
            raise serializers.ValidationError("Заполните все поля")

        data['user'] = user
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', required=False)
    photo = serializers.SerializerMethodField()
    avatar = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'photo', 'avatar', 'is_staff']
        
    def get_photo(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None