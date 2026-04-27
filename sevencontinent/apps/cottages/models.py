from django.db import models
from django.core.validators import MinValueValidator
from django.db.models.signals import post_delete
from django.dispatch import receiver
import os
from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile


class Cottage(models.Model):
    """
    Модель домика для аренды
    """
    title = models.CharField(
        max_length=200,
        verbose_name='Название домика'
    )
    HOUSE_TYPES = (
        ('big', '6-местный коттедж (Большой дом)'),
        ('small', '4-местный коттедж (Малый дом)'),
    )
    house_type = models.CharField(
        max_length=10,
        choices=HOUSE_TYPES,
        default='small',
        verbose_name='Тип домика'
    )

    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Цена за ночь (руб)',
        validators=[MinValueValidator(0)]
    )
    capacity = models.IntegerField(
        verbose_name='Вместимость (человек)',
        validators=[MinValueValidator(1)],
        default=2
    )
    bedrooms = models.IntegerField(
        verbose_name='Количество спален',
        validators=[MinValueValidator(1)],
        default=1
    )

    area = models.IntegerField(
        verbose_name='Площадь (м²)',
        validators=[MinValueValidator(1)],
        default=30
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата добавления'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        db_table = 'cottages'
        verbose_name = 'Домик'
        verbose_name_plural = 'Домики'
        ordering = ['id']
    
    def save(self, *args, **kwargs):
        if self.house_type == 'big':
            self.price_per_night = 14000.00
            self.capacity = 6
            self.area = 75
            self.bedrooms = 2
        elif self.house_type == 'small':
            self.price_per_night = 10000.00
            self.capacity = 4
            self.area = 36
            self.bedrooms = 1
        super().save(*args, **kwargs)

    def __str__(self):
        """Всегда возвращаем строку"""
        # Если есть имя, возвращаем его как строку
        if self.title:
            return str(self.title)
        # Если есть ID (объект сохранен), возвращаем ID
        if self.pk:
            return f"Домик #{self.pk}"
        # Если объект новый и без имени
        return "Новый домик"


class CottageImage(models.Model):
    """
    Изображения домика
    """
    house_type = models.CharField(
        max_length=10,
        choices=Cottage.HOUSE_TYPES,
        verbose_name='Тип домика',
        default='big'
    )
    image = models.ImageField(
        upload_to='cottages/',
        verbose_name='Изображение'
    )
    is_main = models.BooleanField(
        default=False,
        verbose_name='Главное фото'
    )
    display_order = models.IntegerField(
        default=0,
        verbose_name='Порядок сортировки'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата добавления'
    )
    
    class Meta:
        db_table = 'cottage_images'
        verbose_name = 'Изображение домика'
        verbose_name_plural = 'Изображения домиков'
        ordering = ['display_order', '-is_main', '-created_at']
    
    def __str__(self):
        type_display = dict(Cottage.HOUSE_TYPES).get(self.house_type, self.house_type)
        return f"Фото ({type_display}) - {self.id}"

    def save(self, *args, **kwargs):
        if self.image:
            ext = os.path.splitext(self.image.name)[1].lower()
            if ext not in ['.webp']:
                try:
                    print("Opening image...", self.image.name)
                    img = Image.open(self.image)
                    if img.mode not in ('RGB', 'RGBA'):
                        img = img.convert('RGBA')

                    print("Saving output to BytesIO...")
                    # Пропорциональное уменьшение до макс 1920x1920
                    img.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
                    
                    output = BytesIO()
                    img.save(output, format='WEBP', quality=85)
                    output.seek(0)

                    print("Closing original image object...")
                    img.close()

                    base_name = os.path.splitext(os.path.basename(self.image.name))[0]
                    new_file_name = f"{base_name}.webp"
                    
                    print("Saving to FieldFile:", new_file_name)
                    self.image.save(new_file_name, ContentFile(output.read()), save=False)
                    print("Saved to FieldFile.")
                except Exception as e:
                    print(f"Error converting image to WEBP: {e}")

        # ensure standard save happens
        print("Super saving...")
        super().save(*args, **kwargs)
        print("Super saved.")

@receiver(post_delete, sender=CottageImage)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem when corresponding `CottageImage` object is deleted.
    """
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)