from django.db import models

class ContactRequest(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'Новая'),
        ('IN_PROGRESS', 'В работе'),
        ('COMPLETED', 'Завершена'),
        ('CANCELLED', 'Отменена'),
    ]

    name = models.CharField(max_length=255, verbose_name="Имя")
    phone = models.CharField(max_length=50, verbose_name="Номер телефона")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW', verbose_name="Статус")
    manager_comment = models.TextField(blank=True, null=True, verbose_name="Комментарий менеджера")
    is_viewed = models.BooleanField(default=False, verbose_name="Просмотрено администратором", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создана")

    class Meta:
        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.phone}"
