from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Админка для управления бронированиями
    """
    list_display = [
        'id', 'user', 'cottage', 'check_in_date', 'check_out_date',
        'guests_count', 'total_price', 'status', 'created_at'
    ]
    list_display_links = ['id', 'user']
    list_filter = ['status', 'check_in_date', 'created_at']
    search_fields = ['user__username', 'user__email', 'cottage__name']
    readonly_fields = ['created_at', 'updated_at']
    list_select_related = ['user', 'cottage']
    
    fieldsets = (
        ('Информация о бронировании', {
            'fields': ('user', 'cottage', 'status')
        }),
        ('Даты', {
            'fields': ('check_in_date', 'check_out_date')
        }),
        ('Детали', {
            'fields': ('guests_count', 'total_price', 'special_requests')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['confirm_bookings', 'cancel_bookings', 'complete_bookings']
    
    def confirm_bookings(self, request, queryset):
        """Массовое подтверждение бронирований"""
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} бронирований подтверждено')
    confirm_bookings.short_description = "Подтвердить выбранные бронирования"
    
    def cancel_bookings(self, request, queryset):
        """Массовая отмена бронирований"""
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} бронирований отменено')
    cancel_bookings.short_description = "Отменить выбранные бронирования"
    
    def complete_bookings(self, request, queryset):
        """Массовое завершение бронирований"""
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} бронирований завершено')
    complete_bookings.short_description = "Завершить выбранные бронирования"
