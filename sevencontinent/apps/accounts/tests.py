from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'test@test.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Тест',
            'last_name': 'Тестов'
        }

    def test_user_registration(self):
        """Тест регистрации пользователя"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(response.data['user']['username'], 'testuser')
        self.assertIn('access', response.data)

    def test_user_registration_password_mismatch(self):
        """Тест ошибки при несовпадении паролей"""
        data = self.user_data.copy()
        data['password_confirm'] = 'wrongpass'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_email(self):
        """Тест ошибки при дублировании email"""
        # Первая регистрация
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Вторая регистрация с тем же email
        data = self.user_data.copy()
        data['username'] = 'anotheruser'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """Тест входа пользователя"""
        # Регистрируем
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Входим
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_user_login_wrong_password(self):
        """Тест входа с неверным паролем"""
        self.client.post(self.register_url, self.user_data, format='json')
        
        login_data = {
            'username': 'testuser',
            'password': 'wrongpass'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_access_without_token(self):
        """Тест доступа к профилю без токена"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_access_with_token(self):
        """Тест доступа к профилю с токеном"""
        # Регистрируем и получаем токен
        register_response = self.client.post(self.register_url, self.user_data, format='json')
        token = register_response.data['access']
        
        # Доступ к профилю с токеном
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')


