from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True, verbose_name='Электронная почта')
    phone = models.CharField(max_length=25, blank=True, verbose_name='Телефон')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, verbose_name='Аватар')
    is_verified = models.BooleanField(default=False, verbose_name='Подтвержден')
    is_viewed = models.BooleanField(default=False, verbose_name='Просмотрен админом')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата регистрации')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} - {self.email}"

class EmailVerificationCode(models.Model):
    PURPOSE_REGISTER = 'register'
    PURPOSE_RESET = 'reset_password'
    PURPOSE_CHOICES = [
        (PURPOSE_REGISTER, 'Registration'),
        (PURPOSE_RESET, 'Password Reset'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_codes')
    code = models.CharField(max_length=6, verbose_name='Код подтверждения')
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default=PURPOSE_REGISTER)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'email_verification_codes'
        verbose_name = 'Код подтверждения'
        verbose_name_plural = 'Коды подтверждения'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.code} ({self.purpose})"
