from rest_framework import serializers
from .models import ContactRequest

class ContactRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = ['id', 'name', 'phone', 'status', 'manager_comment', 'created_at']
        read_only_fields = ['status', 'manager_comment', 'created_at']
