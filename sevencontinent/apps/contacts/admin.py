from django.contrib import admin
from .models import ContactRequest

@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'phone', 'manager_comment')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Информация о клиенте', {
            'fields': ('name', 'phone', 'created_at')
        }),
        ('Обработка', {
            'fields': ('status', 'manager_comment')
        }),
    )
