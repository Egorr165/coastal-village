from django.contrib import admin
from django.utils.html import format_html
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """
    Админка для управления отзывами
    """
    list_display = [
        'id', 'user', 'cottage', 'rating', 'comment_preview', 
        'is_approved', 'created_at', 'approve_button'
    ]
    list_display_links = ['id', 'user']
    list_filter = ['is_approved', 'rating', 'created_at']
    search_fields = ['user__username', 'user__email', 'cottage__name', 'comment']
    readonly_fields = ['created_at', 'updated_at', 'user', 'cottage', 'booking']
    list_select_related = ['user', 'cottage', 'booking']
    
    fieldsets = (
        ('Информация об отзыве', {
            'fields': ('user', 'cottage', 'booking', 'rating', 'comment')
        }),
        ('Модерация', {
            'fields': ('is_approved',),
            'classes': ('wide',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def comment_preview(self, obj):
        """Превью комментария"""
        if len(obj.comment) > 50:
            return obj.comment[:50] + '...'
        return obj.comment
    comment_preview.short_description = 'Комментарий (превью)'
    
    def approve_button(self, obj):
        """Кнопка одобрения отзыва"""
        if not obj.is_approved:
            return format_html(
                '<a class="button" href="{}" style="background: #28a745; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px;">✅ Одобрить</a>',
                f'/admin/reviews/review/{obj.id}/change/'
            )
        return format_html('<span style="color: green;">✓ Одобрен</span>')
    approve_button.short_description = 'Действие'
    
    actions = ['approve_reviews', 'reject_reviews']
    
    def approve_reviews(self, request, queryset):
        """Массовое одобрение отзывов"""
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} отзывов одобрено')
    approve_reviews.short_description = "Одобрить выбранные отзывы"
    
    def reject_reviews(self, request, queryset):
        """Массовое отклонение отзывов"""
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} отзывов отклонено')
    reject_reviews.short_description = "Отклонить выбранные отзывы"