from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg
from .models import Review
from .serializers import (
    ReviewSerializer, ReviewCreateSerializer,
    ReviewModerateSerializer
)

class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления отзывами
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rating', 'is_approved', 'cottage']
    search_fields = ['comment', 'user__username']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Установка прав доступа в зависимости от действия
        """
        if self.action in ['create', 'my_reviews']:
            return [IsAuthenticated()]
        elif self.action in ['list', 'retrieve', 'by_cottage']:
            return [AllowAny()]
        return super().get_permissions()
    
    def get_queryset(self):
        """
        Возвращает одобренные отзывы для всех, все отзывы для админов
        """
        user = self.request.user
        
        # Админы видят все отзывы
        if user.is_staff:
            return Review.objects.select_related('user', 'cottage', 'booking').all()
        
        # Обычные пользователи видят только одобренные отзывы
        return Review.objects.filter(is_approved=True).select_related('user', 'cottage', 'booking')
    
    def get_serializer_class(self):
        """
        Выбор сериализатора в зависимости от действия
        """
        if self.action == 'create':
            return ReviewCreateSerializer
        elif self.action in ['update', 'partial_update', 'approve', 'reject']:
            return ReviewModerateSerializer
        return ReviewSerializer
    
    def get_serializer_context(self):
        """Передаем request в контекст"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """
        Одобрить отзыв (только для администраторов)
        """
        review = self.get_object()
        review.approve()
        
        return Response({
            'status': 'success',
            'message': 'Отзыв одобрен и опубликован',
            'review': ReviewSerializer(review).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """
        Отклонить отзыв (только для администраторов)
        """
        review = self.get_object()
        review.reject()
        
        return Response({
            'status': 'success',
            'message': 'Отзыв отклонен',
            'review': ReviewSerializer(review).data
        })
    
    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """
        Получить все одобренные отзывы текущего пользователя
        """
        reviews = Review.objects.filter(user=request.user, is_approved=True).select_related('cottage')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Получить отзывы, ожидающие модерации (только для админов)
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Доступно только для администраторов'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reviews = Review.objects.filter(is_approved=False).select_related('user', 'cottage')
        
        # Пагинация
        page = self.paginate_queryset(reviews)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_cottage(self, request):
        """
        Получить отзывы по домику
        """
        cottage_id = request.query_params.get('cottage_id')
        if not cottage_id:
            return Response(
                {'error': 'Необходимо указать cottage_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reviews = Review.objects.filter(cottage_id=cottage_id, is_approved=True)
        serializer = self.get_serializer(reviews, many=True)
        
        # Добавляем средний рейтинг
        from django.db.models import Avg
        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        
        return Response({
            'cottage_id': cottage_id,
            'average_rating': round(avg_rating, 1),
            'reviews_count': reviews.count(),
            'reviews': serializer.data
        })