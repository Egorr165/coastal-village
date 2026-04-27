from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_verified', 'is_active')
    list_filter = ('is_verified', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Личная информация', {'fields': ('first_name', 'last_name', 'email', 'phone', 'avatar')}),
        ('Статус', {'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser')}),
        ('Даты', {'fields': ('created_at', 'updated_at', 'last_login', 'date_joined')}),
    )