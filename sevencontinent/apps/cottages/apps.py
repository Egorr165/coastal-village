from django.apps import AppConfig

class CottagesConfig(AppConfig):
    """Конфигурация приложения cottages"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.cottages'  # Важно: с префиксом 'apps.'
    verbose_name = 'Управление домиками'