from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.conf import settings
from apps.cottages.models import Cottage
from datetime import date

class Booking(models.Model):
    """
    Модель бронирования домика
    """
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Ожидает подтверждения'
        CONFIRMED = 'confirmed', 'Подтверждено'
        CANCELLED = 'cancelled', 'Отменено'
        COMPLETED = 'completed', 'Завершено'

    # Связи с другими моделями
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name='Пользователь'
    )
    cottage = models.ForeignKey(
        Cottage,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name='Домик'
    )
    
    # Даты бронирования
    check_in_date = models.DateField(
        verbose_name='Дата заезда'
    )
    check_out_date = models.DateField(
        verbose_name='Дата выезда'
    )
    
    # Детали бронирования
    guests_count = models.IntegerField(
        verbose_name='Количество гостей',
        validators=[MinValueValidator(1)],
        default=1
    )
    extra_bed_count = models.IntegerField(
        verbose_name='Количество доп. мест',
        validators=[MinValueValidator(0)],
        default=0
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Общая стоимость',
        validators=[MinValueValidator(0)]
    )
    
    # Статус бронирования
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        verbose_name='Статус',
        db_index=True
    )
    
    # Дополнительные пожелания
    special_requests = models.TextField(
        blank=True,
        verbose_name='Особые пожелания',
        default=''
    )
    
    # Системные поля
    is_viewed = models.BooleanField(
        default=False,
        verbose_name='Просмотрено администратором',
        db_index=True
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания',
        db_index=True
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        db_table = 'bookings'
        verbose_name = 'Бронирование'
        verbose_name_plural = 'Бронирования'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'check_in_date']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['cottage', 'check_in_date']),
        ]
    
    def __str__(self):
        """Безопасное строковое представление"""
        # Безопасное получение имени пользователя
        if hasattr(self.user, 'username') and self.user.username:
            username = self.user.username
        else:
            username = f"User {self.user_id}"
        
        # Безопасное получение названия домика
        if hasattr(self.cottage, 'name') and self.cottage.name:
            cottage_name = self.cottage.name
        else:
            cottage_name = f"Cottage {self.cottage_id}"
        
        return f"Бронирование #{self.pk} - {cottage_name} - {username}"
    
    def clean(self):
        """
        Валидация дат бронирования
        Вызывается автоматически перед сохранением
        """
        # Проверка что выезд после заезда
        if self.check_in_date >= self.check_out_date:
            raise ValidationError('Дата выезда должна быть позже даты заезда')
        
        # Проверка что дата заезда не в прошлом
        if self.check_in_date < date.today():
            raise ValidationError('Дата заезда не может быть в прошлом')
    
    def save(self, *args, **kwargs):
        """Переопределенный save с валидацией"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    def get_nights_count(self):
        """Количество ночей бронирования"""
        return (self.check_out_date - self.check_in_date).days
    
    def calculate_total_price(self):
        """Пересчет общей стоимости"""
        nights = self.get_nights_count()
        base_price = self.cottage.price_per_night * nights
        extras_price = 1500 * nights * self.extra_bed_count
        return base_price + extras_price
    
    def can_be_cancelled(self):
        """Проверка возможности отмены бронирования"""
        return (
            self.status in [self.StatusChoices.PENDING, self.StatusChoices.CONFIRMED] and
            (self.check_in_date - date.today()).days >= 14
        )
    
    def cancel(self):
        """Отмена бронирования"""
        if self.can_be_cancelled():
            self.status = self.StatusChoices.CANCELLED
            self.is_viewed = False
            self.save()
            return True
        return False
    
    def confirm(self):
        """Подтверждение бронирования (для администратора)"""
        if self.status == self.StatusChoices.PENDING:
            self.status = self.StatusChoices.CONFIRMED
            self.save()
            return True
        return False
    
    def complete(self):
        """Завершение бронирования (после выезда)"""
        if (self.status == self.StatusChoices.CONFIRMED and 
            self.check_out_date <= date.today()):
            self.status = self.StatusChoices.COMPLETED
            self.save()
            return True
        return False

    @classmethod
    def auto_complete_expired(cls):
        """Автоматически переводит все завершившиеся по дате подтвержденные бронирования в статус Завершено"""
        return cls.objects.filter(
            status=cls.StatusChoices.CONFIRMED,
            check_out_date__lte=date.today()
        ).update(status=cls.StatusChoices.COMPLETED)