from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Q
from datetime import date
from .models import Booking
from .serializers import (
    BookingSerializer, BookingCreateSerializer,
    BookingUpdateSerializer
)

class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления бронированиями
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['cottage__name', 'cottage__address']
    ordering_fields = ['check_in_date', 'created_at', 'total_price']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='next-id')
    def next_id(self, request):
        """Возвращает ID следующего бронирования для отображения в модалке"""
        last_booking = Booking.objects.order_by('-id').first()
        next_id = (last_booking.id + 1) if last_booking else 1
        return Response({'next_id': next_id})
    
    def get_queryset(self):
        """
        Возвращает queryset с учетом прав пользователя и фильтров
        """
        user = self.request.user
        queryset = Booking.objects.select_related('user', 'cottage')
        
        # Пользователи видят только свои бронирования, админы - все
        if not user.is_staff:
            queryset = queryset.filter(user=user)
        
        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Фильтрация по дате заезда (от)
        check_in_from = self.request.query_params.get('check_in_from')
        if check_in_from:
            queryset = queryset.filter(check_in_date__gte=check_in_from)
        
        # Фильтрация по дате заезда (до)
        check_in_to = self.request.query_params.get('check_in_to')
        if check_in_to:
            queryset = queryset.filter(check_in_date__lte=check_in_to)
        
        # Фильтрация по дате выезда (от)
        check_out_from = self.request.query_params.get('check_out_from')
        if check_out_from:
            queryset = queryset.filter(check_out_date__gte=check_out_from)
        
        # Фильтрация по дате выезда (до)
        check_out_to = self.request.query_params.get('check_out_to')
        if check_out_to:
            queryset = queryset.filter(check_out_date__lte=check_out_to)
        
        # Фильтрация по ID домика
        cottage_id = self.request.query_params.get('cottage_id')
        if cottage_id:
            queryset = queryset.filter(cottage_id=cottage_id)
        
        # Фильтрация по ID пользователя (только для админов)
        user_id = self.request.query_params.get('user_id')
        if user_id and user.is_staff:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset
    
    def get_serializer_class(self):
        """
        Выбор сериализатора в зависимости от действия
        """
        if self.action == 'create':
            return BookingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookingUpdateSerializer
        return BookingSerializer
    
    def get_serializer_context(self):
        """
        Передаем request в контекст сериализатора
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Отмена бронирования
        Доступно для владельца бронирования и администратора
        """
        booking = self.get_object()
        
        # Проверка прав
        if not request.user.is_staff and booking.user != request.user:
            return Response(
                {'error': 'Нет прав для отмены этого бронирования'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.cancel():
            return Response({
                'status': 'success',
                'message': 'Бронирование отменено',
                'booking': BookingSerializer(booking).data
            })
        else:
            return Response(
                {'error': 'Невозможно отменить бронирование. До заезда осталось менее 14 дней или бронь уже отменена.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def confirm(self, request, pk=None):
        """
        Подтверждение бронирования
        Только для администраторов
        """
        booking = self.get_object()
        if booking.confirm():
            return Response({
                'status': 'success',
                'message': 'Бронирование подтверждено',
                'booking': BookingSerializer(booking).data
            })
        return Response(
            {'error': 'Невозможно подтвердить бронирование. Возможно, оно уже подтверждено или отменено.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def complete(self, request, pk=None):
        """
        Завершение бронирования
        Только для администраторов
        """
        booking = self.get_object()
        if booking.complete():
            return Response({
                'status': 'success',
                'message': 'Бронирование завершено',
                'booking': BookingSerializer(booking).data
            })
        return Response(
            {'error': 'Невозможно завершить бронирование. Проверьте, что дата выезда уже прошла.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """
        Получить все бронирования текущего пользователя
        """
        bookings = Booking.objects.filter(user=request.user).select_related('cottage').order_by('-created_at')
        
        # Применяем те же фильтры
        status_filter = request.query_params.get('status')
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Получить предстоящие бронирования (активные и в будущем)
        """
        bookings = Booking.objects.filter(
            user=request.user,
            status__in=['confirmed', 'pending'],
            check_in_date__gte=date.today()
        ).select_related('user', 'cottage').order_by('check_in_date')
        
        # Пагинация
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Получить статистику по бронированиям (только для админов)
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Доступно только для администраторов'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.db.models import Count, Sum
        
        total_bookings = Booking.objects.count()
        pending = Booking.objects.filter(status='pending').count()
        confirmed = Booking.objects.filter(status='confirmed').count()
        cancelled = Booking.objects.filter(status='cancelled').count()
        completed = Booking.objects.filter(status='completed').count()
        
        total_revenue = Booking.objects.filter(
            status__in=['confirmed', 'completed']
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        # Популярные домики
        popular_cottages = Booking.objects.values('cottage__name').annotate(
            count=Count('id'),
            revenue=Sum('total_price')
        ).filter(status__in=['confirmed', 'completed']).order_by('-count')[:5]
        
        return Response({
            'total_bookings': total_bookings,
            'by_status': {
                'pending': pending,
                'confirmed': confirmed,
                'cancelled': cancelled,
                'completed': completed
            },
            'total_revenue': total_revenue,
            'popular_cottages': list(popular_cottages)
        })
    
    @action(detail=False, methods=['get'])
    def available_dates(self, request):
        """
        Получить доступные даты для домика
        """
        cottage_id = request.query_params.get('cottage_id')
        if not cottage_id:
            return Response(
                {'error': 'Необходимо указать cottage_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем занятые даты
        bookings = Booking.objects.filter(
            cottage_id=cottage_id,
            status__in=['pending', 'confirmed']
        ).values('check_in_date', 'check_out_date')
        
        occupied_dates = []
        for booking in bookings:
            occupied_dates.append({
                'start': booking['check_in_date'],
                'end': booking['check_out_date']
            })
        
        return Response({
            'cottage_id': cottage_id,
            'occupied_dates': occupied_dates
        })