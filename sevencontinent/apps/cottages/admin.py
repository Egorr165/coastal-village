from django import forms
from django.contrib import admin
from .models import Cottage, CottageImage

class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleFileField(forms.FileField):
    def to_python(self, data):
        if not data:
            return []
        return data

    def validate(self, data):
        pass

class CottageAdminForm(forms.ModelForm):
    # Оставляем классический вариант
    class Meta:
        model = Cottage
        fields = '__all__'

class CottageImageAdminForm(forms.ModelForm):
    image = forms.ImageField(
        label='Главное фото (1 шт)',
        required=False,
        help_text='Загрузите сюда одно фото, чтобы оно стало ОБЛОЖКОЙ домика.'
    )
    additional_images = MultipleFileField(
        widget=MultipleFileInput(attrs={'multiple': True}),
        label='Галерея (Массовая загрузка)',
        required=False,
        help_text='Выделите сразу сколько угодно файлов для обычной галереи.'
    )

    class Meta:
        model = CottageImage
        fields = ['house_type', 'image', 'additional_images']

    def clean(self):
        cleaned_data = super().clean()
        image = cleaned_data.get('image')
        additional = self.files.getlist('additional_images')
        
        if not image and not additional:
            raise forms.ValidationError("Пожалуйста, загрузите хотя бы в одно из полей: Главное фото или Галерея.")
        return cleaned_data


@admin.register(Cottage)
class CottageAdmin(admin.ModelAdmin):
    """Админка для домиков"""
    form = CottageAdminForm
    list_display = ['id', 'title', 'house_type', 'price_per_night', 'capacity', 'is_active']
    list_display_links = ['id', 'title']
    list_filter = ['is_active', 'house_type', 'bedrooms', 'capacity']
    search_fields = ['title']
    
    class Media:
        js = ('admin/js/cottage_type_autofill.js',)
        
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'house_type')
        }),
        ('Характеристики', {
            'fields': ('price_per_night', 'capacity', 'bedrooms', 'area')
        }),

        ('Статус', {
            'fields': ('is_active',)
        }),
    )

@admin.register(CottageImage)
class CottageImageAdmin(admin.ModelAdmin):
    """Отдельная админка для изображений"""
    form = CottageImageAdminForm
    list_display = ['id', 'house_type', 'is_main', 'created_at']
    list_display_links = ['id']
    list_filter = ['is_main', 'created_at']
    search_fields = ['house_type']
    actions = ['delete_selected_images']

    @admin.action(description='Удалить выбранные фотографии')
    def delete_selected_images(self, request, queryset):
        deleted_count = queryset.count()
        # Удаляем поштучно, чтобы срабатывали сигналы удаления файлов (если есть)
        for obj in queryset:
            obj.delete()
        self.message_user(request, f"Успешно удалено {deleted_count} фотографий.")

    def save_model(self, request, obj, form, change):
        additional_images = request.FILES.getlist('additional_images')
        main_image = form.cleaned_data.get('image')

        # Если загрузили именно Главное фото
        if main_image:
            # Снимаем статус у старых главных фото этого типа домика
            if not change:
                CottageImage.objects.filter(house_type=obj.house_type, is_main=True).update(is_main=False)
            obj.is_main = True
            super().save_model(request, obj, form, change)
        elif additional_images:
            # Если загрузили ТОЛЬКО массовые фото, берем первое из них как основу для записи
            obj.image = additional_images.pop(0)
            obj.is_main = False
            super().save_model(request, obj, form, change)

        # Распаковываем оставшиеся дополнительные фото
        for img in additional_images:
            CottageImage.objects.create(house_type=obj.house_type, image=img, is_main=False)