from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.bookings.models import Booking
from .serializers import AdminBookingSerializer
from .permissions import IsAdminUser

class AdminBookingViewSet(viewsets.ModelViewSet):
    """
    Эндпоинты для управления бронированиями из панели администратора.
    Все методы требуют IsAdminUser.
    """
    serializer_class = AdminBookingSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        # Автоматически завершаем просроченные бронирования перед выдачей списка
        Booking.auto_complete_expired()
        return Booking.objects.all().order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='mark-viewed')
    def mark_viewed(self, request):
        status_filter = request.query_params.get('status')
        qs = Booking.objects.filter(is_viewed=False)
        if status_filter:
            qs = qs.filter(status=status_filter)
        updated = qs.update(is_viewed=True)
        return Response({'updated': updated})

    @action(detail=False, methods=['post'], url_path='bulk-confirm')
    def bulk_confirm(self, request):
        ids = request.data.get('ids', [])
        updated = Booking.objects.filter(id__in=ids).update(status=Booking.StatusChoices.CONFIRMED)
        return Response({'message': f'{updated} бронирований подтверждено', 'updated': updated})

    @action(detail=False, methods=['post'], url_path='bulk-cancel')
    def bulk_cancel(self, request):
        ids = request.data.get('ids', [])
        updated = Booking.objects.filter(id__in=ids).update(status=Booking.StatusChoices.CANCELLED)
        return Response({'message': f'{updated} бронирований отменено', 'updated': updated})

    @action(detail=False, methods=['post'], url_path='bulk-complete')
    def bulk_complete(self, request):
        ids = request.data.get('ids', [])
        updated = Booking.objects.filter(id__in=ids).update(status=Booking.StatusChoices.COMPLETED)
        return Response({'message': f'{updated} бронирований завершено', 'updated': updated})
