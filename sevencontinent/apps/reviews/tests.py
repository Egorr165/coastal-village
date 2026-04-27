from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date, timedelta
from decimal import Decimal
from rest_framework_simplejwt.tokens import RefreshToken  # Добавляем этот импорт

from apps.accounts.models import User
from apps.cottages.models import Cottage
from apps.bookings.models import Booking
from .models import Review

class ReviewModelTest(TestCase):
    """Тесты для модели Review"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.cottage = Cottage.objects.create(
            name='Тестовый домик',
            price_per_night=Decimal('5000.00')
        )
        
        # Создаем завершенное бронирование
        self.booking = Booking.objects.create(
            user=self.user,
            cottage=self.cottage,
            check_in_date=date.today() - timedelta(days=10),
            check_out_date=date.today() - timedelta(days=5),
            guests_count=2,
            total_price=Decimal('25000.00'),
            status='completed'
        )
        
        self.review = Review.objects.create(
            user=self.user,
            cottage=self.cottage,
            booking=self.booking,
            rating=5,
            comment='Отличный домик!'
        )
    
    def test_review_creation(self):
        """Тест создания отзыва"""
        self.assertEqual(self.review.user, self.user)
        self.assertEqual(self.review.cottage, self.cottage)
        self.assertEqual(self.review.rating, 5)
        self.assertEqual(self.review.comment, 'Отличный домик!')
        self.assertFalse(self.review.is_approved)
    
    def test_review_str_method(self):
        """Тест строкового представления"""
        expected = f"Отзыв #{self.review.pk} - {self.cottage.name} - 5★"
        self.assertEqual(str(self.review), expected)
    
    def test_approve_review(self):
        """Тест одобрения отзыва"""
        self.review.approve()
        self.review.refresh_from_db()
        self.assertTrue(self.review.is_approved)
    
    def test_reject_review(self):
        """Тест отклонения отзыва"""
        self.review.reject()
        self.review.refresh_from_db()
        self.assertFalse(self.review.is_approved)


class ReviewAPITest(APITestCase):
    """Тесты для API отзывов"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.cottage = Cottage.objects.create(
            name='Тестовый домик',
            price_per_night=5000
        )
        
        # Создаем завершенное бронирование
        self.booking = Booking.objects.create(
            user=self.user,
            cottage=self.cottage,
            check_in_date=date.today() - timedelta(days=10),
            check_out_date=date.today() - timedelta(days=5),
            guests_count=2,
            total_price=25000,
            status='completed'
        )
        
        self.review_data = {
            'cottage': self.cottage.id,
            'booking': self.booking.id,
            'rating': 5,
            'comment': 'Отличный домик!'
        }
        
        # Создаем токен для пользователя
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_create_review(self):
        """Тест создания отзыва"""
        response = self.client.post('/api/reviews/', self.review_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        self.assertFalse(response.data['is_approved'])
    
    def test_cannot_review_before_completion(self):
        """Тест невозможности оставить отзыв до завершения бронирования"""
        # Создаем активное бронирование
        active_booking = Booking.objects.create(
            user=self.user,
            cottage=self.cottage,
            check_in_date=date.today() + timedelta(days=10),
            check_out_date=date.today() + timedelta(days=15),
            guests_count=2,
            total_price=25000,
            status='confirmed'
        )
        
        data = {
            'cottage': self.cottage.id,
            'booking': active_booking.id,
            'rating': 5,
            'comment': 'Отличный домик!'
        }
        
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_cannot_review_other_user_booking(self):
        """Тест невозможности оставить отзыв на чужое бронирование"""
        other_user = User.objects.create_user(
            username='other',
            password='pass123'
        )
        other_booking = Booking.objects.create(
            user=other_user,
            cottage=self.cottage,
            check_in_date=date.today() - timedelta(days=10),
            check_out_date=date.today() - timedelta(days=5),
            guests_count=2,
            total_price=25000,
            status='completed'
        )
        
        data = {
            'cottage': self.cottage.id,
            'booking': other_booking.id,
            'rating': 5,
            'comment': 'Отличный домик!'
        }
        
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_reviews_list(self):
        """Тест получения списка отзывов"""
        # Создаем одобренный отзыв
        Review.objects.create(
            user=self.user,
            cottage=self.cottage,
            booking=self.booking,
            rating=5,
            comment='Отличный домик!',
            is_approved=True
        )
        
        # Создаем неодобренный отзыв
        Review.objects.create(
            user=self.user,
            cottage=self.cottage,
            booking=self.booking,
            rating=4,
            comment='Хороший домик',
            is_approved=False
        )
        
        response = self.client.get('/api/reviews/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Должен быть только одобренный отзыв
        self.assertEqual(len(response.data), 1)
    
    def test_approve_review_admin(self):
        """Тест одобрения отзыва админом"""
        # Создаем отзыв
        review = Review.objects.create(
            user=self.user,
            cottage=self.cottage,
            booking=self.booking,
            rating=5,
            comment='Отличный домик!',
            is_approved=False
        )
        
        # Логинимся как админ
        admin_refresh = RefreshToken.for_user(self.admin)
        admin_token = str(admin_refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        # Одобряем
        response = self.client.post(f'/api/reviews/{review.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        review.refresh_from_db()
        self.assertTrue(review.is_approved)
    
    def test_my_reviews_endpoint(self):
        """Тест получения моих отзывов"""
        Review.objects.create(
            user=self.user,
            cottage=self.cottage,
            booking=self.booking,
            rating=5,
            comment='Отличный домик!'
        )
        
        response = self.client.get('/api/reviews/my_reviews/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_pending_endpoint_admin(self):
        """Тест получения отзывов на модерации (только для админов)"""
        # Создаем неодобренный отзыв
        Review.objects.create(
            user=self.user,
            cottage=self.cottage,
            booking=self.booking,
            rating=5,
            comment='Отличный домик!',
            is_approved=False
        )
        
        # Обычный пользователь не видит
        response = self.client.get('/api/reviews/pending/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Админ видит
        admin_refresh = RefreshToken.for_user(self.admin)
        admin_token = str(admin_refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.get('/api/reviews/pending/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)