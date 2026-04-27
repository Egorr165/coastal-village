from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date, timedelta
from decimal import Decimal

from apps.accounts.models import User
from apps.cottages.models import Cottage
from .models import Booking

class BookingModelTest(TestCase):
    """Тесты для модели Booking"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.cottage = Cottage.objects.create(
            name='Тестовый домик',
            price_per_night=Decimal('5000.00'),
            capacity=4
        )
        self.today = date.today()
        self.check_in = self.today + timedelta(days=10)
        self.check_out = self.check_in + timedelta(days=5)
        
        self.booking = Booking.objects.create(
            user=self.user,
            cottage=self.cottage,
            check_in_date=self.check_in,
            check_out_date=self.check_out,
            guests_count=2,
            total_price=Decimal('25000.00')
        )
    
    def test_booking_creation(self):
        self.assertEqual(self.booking.user, self.user)
        self.assertEqual(self.booking.cottage, self.cottage)
        self.assertEqual(self.booking.status, 'pending')
    
    def test_get_nights_count(self):
        self.assertEqual(self.booking.get_nights_count(), 5)
    
    def test_cancel_booking(self):
        result = self.booking.cancel()
        self.assertTrue(result)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, 'cancelled')


class BookingAPITest(APITestCase):
    """Тесты для API бронирований"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.cottage = Cottage.objects.create(
            name='Тестовый домик',
            price_per_night=5000,
            capacity=4
        )
        self.today = date.today()
        self.check_in = self.today + timedelta(days=10)
        self.check_out = self.check_in + timedelta(days=5)
        
        self.booking_data = {
            'cottage': self.cottage.id,
            'check_in_date': self.check_in.isoformat(),
            'check_out_date': self.check_out.isoformat(),
            'guests_count': 2
        }
        
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_create_booking(self):
        response = self.client.post('/api/bookings/', self.booking_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
    
    def test_get_my_bookings(self):
        self.client.post('/api/bookings/', self.booking_data, format='json')
        response = self.client.get('/api/bookings/my_bookings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)