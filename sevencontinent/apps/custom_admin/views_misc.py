from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.accounts.models import User
from apps.contacts.models import ContactRequest
from apps.bookings.models import Booking
from apps.reviews.models import Review
from .serializers import AdminUserSerializer, AdminContactRequestSerializer, AdminBookingSerializer
from .permissions import IsAdminUser
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from datetime import date, timedelta

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        Booking.auto_complete_expired()
        
        pending_bookings_obj = Booking.objects.filter(is_viewed=False)
        pending_bookings = pending_bookings_obj.count()
        unseen_pending = pending_bookings_obj.filter(status='pending').count()
        unseen_cancelled = pending_bookings_obj.filter(status='cancelled').count()
        
        pending_reviews = Review.objects.filter(is_viewed=False).count()
        pending_contacts = ContactRequest.objects.filter(is_viewed=False).count()
        unseen_users = User.objects.filter(is_viewed=False).exclude(username='offline_guest').count()
        
        latest_booking = Booking.objects.order_by('-created_at').first()
        latest_review = Review.objects.order_by('-created_at').first()
        latest_contact = ContactRequest.objects.order_by('-created_at').first()
        latest_user = User.objects.exclude(username='offline_guest').order_by('-date_joined').first()

        return Response({
            'pending_bookings_count': pending_bookings,
            'unseen_pending_count': unseen_pending,
            'unseen_cancelled_count': unseen_cancelled,
            'pending_reviews_count': pending_reviews,
            'pending_contacts_count': pending_contacts,
            'unseen_users_count': unseen_users,
            'latest_booking_id': latest_booking.id if latest_booking else 0,
            'latest_review_id': latest_review.id if latest_review else 0,
            'latest_contact_id': latest_contact.id if latest_contact else 0,
            'latest_user_id': latest_user.id if latest_user else 0
        })

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        Booking.auto_complete_expired()
        
        today = date.today()
        current_month = today.replace(day=1)
        
        # Общая выручка (подтвержденные и завершенные)
        revenue_qs = Booking.objects.filter(status__in=['confirmed', 'completed'])
        revenue_total = revenue_qs.aggregate(Sum('total_price'))['total_price__sum'] or 0
        revenue_month = revenue_qs.filter(created_at__gte=current_month).aggregate(Sum('total_price'))['total_price__sum'] or 0
        
        # Общее количество броней
        total_bookings = Booking.objects.count()
        month_bookings = Booking.objects.filter(created_at__gte=current_month).count()
        
        # Пользователи
        total_users = User.objects.count()
        month_users = User.objects.filter(date_joined__gte=current_month).count()
        
        # Домики
        from apps.cottages.models import Cottage
        active_cottages = Cottage.objects.filter(is_active=True).count()
        
        # Последние 5 бронирований
        recent_bookings = Booking.objects.order_by('-created_at')[:5]
        serialized_recent = AdminBookingSerializer(recent_bookings, many=True).data
        
        # Данные для графика (последние 14 дней)
        fourteen_days_ago = today - timedelta(days=13)
        daily_stats = Booking.objects.filter(
            status__in=['confirmed', 'completed'],
            created_at__date__gte=fourteen_days_ago
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenue=Sum('total_price'),
            bookings=Count('id')
        ).order_by('date')
        
        chart_data = []
        for i in range(14):
            day = fourteen_days_ago + timedelta(days=i)
            day_str = day.strftime('%d.%m')
            day_data = next((item for item in daily_stats if item['date'] == day), None)
            chart_data.append({
                'date': day_str,
                'revenue': float(day_data['revenue']) if day_data and day_data['revenue'] else 0,
                'bookings': int(day_data['bookings']) if day_data and day_data['bookings'] else 0
            })
        
        return Response({
            'revenue': {
                'total': revenue_total,
                'month': revenue_month
            },
            'bookings': {
                'total': total_bookings,
                'month': month_bookings
            },
            'users': {
                'total': total_users,
                'month': month_users
            },
            'cottages': {
                'active': active_cottages
            },
            'recent_bookings': serialized_recent,
            'chart_data': chart_data
        })

class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        User.objects.get_or_create(
            email='offline@guest.local',
            defaults={
                'username': 'offline_guest',
                'first_name': 'ОФФЛАЙН КЛИЕНТ',
                'last_name': '(Без регистрации)',
                'is_active': False
            }
        )
        return User.objects.all().order_by('-date_joined')

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        # Также можем сбрасывать пароль или инвалидировать сессии, но пока просто блокируем
        return Response({'status': 'User blocked successfully (Soft Delete)', 'id': user.id})

    @action(detail=False, methods=['post'], url_path='mark-viewed')
    def mark_viewed(self, request):
        updated = User.objects.filter(is_viewed=False).update(is_viewed=True)
        return Response({'updated': updated})

class AdminContactRequestViewSet(viewsets.ModelViewSet):
    queryset = ContactRequest.objects.all().order_by('-created_at')
    serializer_class = AdminContactRequestSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'], url_path='mark-viewed')
    def mark_viewed(self, request):
        updated = ContactRequest.objects.filter(is_viewed=False).update(is_viewed=True)
        return Response({'updated': updated})

    @action(detail=False, methods=['post'], url_path='bulk-status')
    def bulk_status(self, request):
        ids = request.data.get('ids', [])
        status_val = request.data.get('status')
        if not ids or not status_val:
            return Response({'error': 'ids and status are required'}, status=400)
        updated = ContactRequest.objects.filter(id__in=ids).update(status=status_val)
        return Response({'updated': updated})
