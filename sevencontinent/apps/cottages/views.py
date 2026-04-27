from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import Cottage
from .serializers import CottageListSerializer, CottageDetailSerializer

class CottageViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления домиками
    """
    queryset = Cottage.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'capacity', 'bedrooms']
    search_fields = ['title']
    ordering_fields = ['price_per_night', 'capacity', 'id', 'title']
    ordering = ['id']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CottageListSerializer
        return CottageDetailSerializer
    
    def get_queryset(self):
        """
        Фильтрация queryset на основе параметров запроса
        """
        queryset = Cottage.objects.filter(is_active=True)
        
        # Фильтр по цене
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price_per_night__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_night__lte=max_price)
        
        # Фильтр по вместимости
        min_capacity = self.request.query_params.get('min_capacity')
        if min_capacity:
            queryset = queryset.filter(capacity__gte=min_capacity)
        
        return queryset.distinct()
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def availability(self, request, pk=None):
        """Проверка доступности домика на даты"""
        cottage = self.get_object()
        check_in = request.query_params.get('check_in')
        check_out = request.query_params.get('check_out')
        
        if not check_in or not check_out:
            return Response(
                {'error': 'Необходимо указать check_in и check_out'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'available': True, 'cottage_id': cottage.id})
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def similar(self, request, pk=None):
        """Похожие домики"""
        cottage = self.get_object()
        similar_cottages = Cottage.objects.filter(
            is_active=True,
            capacity__gte=cottage.capacity - 2,
            capacity__lte=cottage.capacity + 2,
            price_per_night__gte=cottage.price_per_night * 0.7,
            price_per_night__lte=cottage.price_per_night * 1.3
        ).exclude(id=cottage.id)[:4]
        
        serializer = CottageListSerializer(
            similar_cottages, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

