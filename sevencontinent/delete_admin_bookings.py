import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sevencontinent.settings')
django.setup()

from apps.bookings.models import Booking

def run():
    deleted, _ = Booking.objects.filter(user__is_staff=True).delete()
    print(f"Успешно удалено {deleted} бронирований, созданных от имени администратора.")

if __name__ == '__main__':
    run()
