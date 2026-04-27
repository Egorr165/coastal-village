from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from .models import Amenity, Cottage, CottageImage

class AmenityModelTest(TestCase):
    """Тесты для модели Amenity"""
    
    def setUp(self):
        """Подготовка данных перед каждым тестом"""
        # pylint: disable=no-member
        self.amenity = Amenity.objects.create(
            name='Wi-Fi',
            icon='fas fa-wifi'
        )
    
    def test_amenity_creation(self):
        """Тест создания удобства"""
        self.assertEqual(self.amenity.name, 'Wi-Fi')
        self.assertEqual(self.amenity.icon, 'fas fa-wifi')
        self.assertIsNotNone(self.amenity.created_at)
    
    def test_amenity_str_method(self):
        """Тест строкового представления"""
        self.assertEqual(str(self.amenity), 'Wi-Fi')
    
    def test_amenity_unique_name(self):
        """Тест уникальности названия"""
        with self.assertRaises(Exception):
            # pylint: disable=no-member
            Amenity.objects.create(name='Wi-Fi')


class CottageModelTest(TestCase):
    """Тесты для модели Cottage"""
    
    def setUp(self):
        """Подготовка данных"""
        # pylint: disable=no-member
        self.cottage = Cottage.objects.create(
            name='Тестовый домик',
            description='Красивый домик в горах',
            address='ул. Тестовая, 1',
            price_per_night=Decimal('5000.00'),
            capacity=4,
            bedrooms=2,
            bathrooms=1.5,
            area=75,
            is_active=True
        )
    
    def test_cottage_creation(self):
        """Тест создания домика"""
        self.assertEqual(self.cottage.name, 'Тестовый домик')
        self.assertEqual(self.cottage.price_per_night, Decimal('5000.00'))
        self.assertTrue(self.cottage.is_active)
        self.assertIsNotNone(self.cottage.created_at)
        self.assertIsNotNone(self.cottage.updated_at)
    
    def test_cottage_str_method(self):
        """Тест строкового представления"""
        self.assertEqual(str(self.cottage), 'Тестовый домик')
    
    def test_cottage_without_name(self):
        """Тест домика без имени"""
        # pylint: disable=no-member
        cottage2 = Cottage.objects.create(
            price_per_night=3000
        )
        self.assertIsNotNone(cottage2.pk)
        self.assertIn('Домик', str(cottage2))
    
    def test_price_validation(self):
        """Тест валидации цены"""
        with self.assertRaises(Exception):
            # pylint: disable=no-member
            Cottage.objects.create(
                name='Дешевый домик',
                price_per_night=Decimal('-1000.00')
            )
    
    def test_capacity_default(self):
        """Тест значения по умолчанию для capacity"""
        # pylint: disable=no-member
        cottage2 = Cottage.objects.create(
            name='Домик',
            price_per_night=3000
        )
        self.assertEqual(cottage2.capacity, 2)
    
    def test_cottage_amenities_relation(self):
        """Тест связи с удобствами"""
        # pylint: disable=no-member
        amenity = Amenity.objects.create(name='Парковка')
        self.cottage.amenities.add(amenity)
        self.assertEqual(self.cottage.amenities.count(), 1)
        self.assertEqual(self.cottage.amenities.first().name, 'Парковка')


class CottageImageModelTest(TestCase):
    """Тесты для модели CottageImage"""
    
    def setUp(self):
        """Подготовка данных"""
        # pylint: disable=no-member
        self.cottage = Cottage.objects.create(
            name='Тестовый домик',
            price_per_night=5000
        )
    
    def create_test_image(self):
        """Создание тестового изображения"""
        from PIL import Image
        import tempfile
        
        image = Image.new('RGB', (100, 100), color='red')
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        image.save(temp_file, format='JPEG')
        temp_file.seek(0)
        
        return SimpleUploadedFile(
            name='test.jpg',
            content=open(temp_file.name, 'rb').read(),
            content_type='image/jpeg'
        )
    
    def test_cottage_image_creation(self):
        """Тест создания изображения"""
        image_file = self.create_test_image()
        # pylint: disable=no-member
        cottage_image = CottageImage.objects.create(
            cottage=self.cottage,
            image=image_file,
            is_main=True
        )
        
        self.assertEqual(cottage_image.cottage, self.cottage)
        self.assertTrue(cottage_image.is_main)
        self.assertIsNotNone(cottage_image.created_at)
    
    def test_cottage_image_str_method(self):
        """Тест строкового представления"""
        image_file = self.create_test_image()
        # pylint: disable=no-member
        cottage_image = CottageImage.objects.create(
            cottage=self.cottage,
            image=image_file
        )
        self.assertIn('Фото для', str(cottage_image))
    
    def test_main_image_constraint(self):
        """Тест что только одно изображение может быть главным"""
        image1 = self.create_test_image()
        image2 = self.create_test_image()
        
        # pylint: disable=no-member
        # Создаем первое главное фото
        img1 = CottageImage.objects.create(
            cottage=self.cottage,
            image=image1,
            is_main=True
        )
        
        # Создаем второе главное фото
        img2 = CottageImage.objects.create(
            cottage=self.cottage,
            image=image2,
            is_main=True
        )
        
        # Обновляем из базы
        img1.refresh_from_db()
        img2.refresh_from_db()
        
        # Первое должно стать не главным, второе - главным
        self.assertFalse(img1.is_main)
        self.assertTrue(img2.is_main)


class CottageAPITest(APITestCase):
    """Тесты для API домиков"""
    
    def setUp(self):
        """Подготовка данных"""
        # pylint: disable=no-member
        # Создаем удобства
        self.amenity1 = Amenity.objects.create(name='Wi-Fi')
        self.amenity2 = Amenity.objects.create(name='Парковка')
        
        # Создаем домики
        self.cottage1 = Cottage.objects.create(
            name='Эконом домик',
            description='Недорогой вариант',
            address='ул. Ленина, 1',
            price_per_night=3000,
            capacity=2
        )
        
        self.cottage2 = Cottage.objects.create(
            name='Люкс домик',
            description='Премиум вариант',
            address='ул. Гагарина, 10',
            price_per_night=10000,
            capacity=6,
            is_active=False
        )
        
        # Добавляем удобства
        self.cottage1.amenities.add(self.amenity1)
        
        # URL для API
        self.list_url = '/api/cottages/cottages/'
    
    def test_get_cottages_list(self):
        """Тест получения списка домиков"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Эконом домик')
    
    def test_get_cottage_detail(self):
        """Тест получения детальной информации о домике"""
        url = f'{self.list_url}{self.cottage1.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Эконом домик')
    
    def test_get_nonexistent_cottage(self):
        """Тест получения несуществующего домика"""
        url = f'{self.list_url}999/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_filter_by_price(self):
        """Тест фильтрации по цене"""
        response = self.client.get(
            self.list_url,
            {'min_price': 2000, 'max_price': 4000}
        )
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Эконом домик')
        
        response = self.client.get(
            self.list_url,
            {'min_price': 5000}
        )
        self.assertEqual(len(response.data), 0)
    
    def test_filter_by_capacity(self):
        """Тест фильтрации по вместимости"""
        response = self.client.get(
            self.list_url,
            {'min_capacity': 3}
        )
        self.assertEqual(len(response.data), 0)
        
        response = self.client.get(
            self.list_url,
            {'min_capacity': 1}
        )
        self.assertEqual(len(response.data), 1)
    
    def test_search_by_name(self):
        """Тест поиска по названию"""
        response = self.client.get(
            self.list_url,
            {'search': 'эконом'}
        )
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Эконом домик')
    
    def test_search_by_address(self):
        """Тест поиска по адресу"""
        response = self.client.get(
            self.list_url,
            {'search': 'Ленина'}
        )
        self.assertEqual(len(response.data), 1)
    
    def test_amenities_list(self):
        """Тест получения списка удобств"""
        url = '/api/cottages/amenities/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_ordering_by_price(self):
        """Тест сортировки по цене"""
        # pylint: disable=no-member
        # Создаем еще один активный домик
        cottage3 = Cottage.objects.create(
            name='Средний домик',
            price_per_night=5000,
            capacity=4
        )
        
        # По возрастанию цены
        response = self.client.get(
            self.list_url,
            {'ordering': 'price_per_night'}
        )
        self.assertEqual(response.data[0]['price_per_night'], '3000.00')
        self.assertEqual(response.data[1]['price_per_night'], '5000.00')
        
        # По убыванию цены
        response = self.client.get(
            self.list_url,
            {'ordering': '-price_per_night'}
        )
        self.assertEqual(response.data[0]['price_per_night'], '5000.00')
        self.assertEqual(response.data[1]['price_per_night'], '3000.00')