from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.conf import settings
from apps.cottages.models import Cottage
from apps.bookings.models import Booking

class Review(models.Model):
    """
    Модель отзыва на домик
    """
    # Связи
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='Пользователь'
    )
    cottage = models.ForeignKey(
        Cottage,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='Домик',
        null=True,
        blank=True
    )
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='review',
        verbose_name='Бронирование',
        help_text='Отзыв может быть оставлен только после завершенного бронирования',
        null=True,
        blank=True
    )
    
    # Оценка и комментарий
    rating = models.IntegerField(
        verbose_name='Оценка',
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Оценка от 1 до 5'
    )
    comment = models.TextField(
        verbose_name='Комментарий',
        help_text='Ваш отзыв о проживании'
    )
    
    # Модерация
    is_approved = models.BooleanField(
        default=False,
        verbose_name='Одобрен',
        help_text='Отзыв прошел модерацию и опубликован'
    )
    
    # Даты и статус просмотра
    is_viewed = models.BooleanField(
        default=False,
        verbose_name='Просмотрено администратором',
        db_index=True
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        db_table = 'reviews'
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_approved']),
            models.Index(fields=['rating']),
            models.Index(fields=['cottage', 'is_approved']),
        ]
    
    def __str__(self):
        cottage_name = self.cottage.name if self.cottage else "Общий отзыв"
        return f"Отзыв #{self.pk} - {cottage_name} - {self.rating}★"
    
    def clean(self):
        """Проверка что отзыв оставляется только после завершенного бронирования (если оно указано)"""
        if self.booking:
            if self.booking.status != 'completed':
                raise ValidationError('Отзыв можно оставить только после завершения бронирования')
            
            # Проверка что отзыв оставляется на тот же домик, что и в бронировании
            if self.cottage and self.cottage != self.booking.cottage:
                raise ValidationError('Отзыв можно оставить только на домик из бронирования')
            
            # Проверка что отзыв оставляет тот же пользователь, что и бронирование
            if self.user != self.booking.user:
                raise ValidationError('Отзыв может оставить только пользователь, который совершил бронирование')
    
    def save(self, *args, **kwargs):
        """Сохраняем с проверками"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    def approve(self):
        """Одобрить отзыв (администратор)"""
        self.is_approved = True
        self.save()
        return True
    
    def reject(self):
        """Отклонить отзыв (администратор)"""
        self.is_approved = False
        self.save()
        return True
