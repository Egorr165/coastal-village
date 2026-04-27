from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reviews.models import Review
from .serializers import AdminReviewSerializer
from .permissions import IsAdminUser

class AdminReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = AdminReviewSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'], url_path='mark-viewed')
    def mark_viewed(self, request):
        updated = Review.objects.filter(is_viewed=False).update(is_viewed=True)
        return Response({'updated': updated})

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        review = self.get_object()
        review.is_approved = True
        review.save()
        return Response({'message': 'Отзыв одобрен.'})

    @action(detail=False, methods=['post'], url_path='bulk-approve')
    def bulk_approve(self, request):
        ids = request.data.get('ids', [])
        updated = Review.objects.filter(id__in=ids).update(is_approved=True)
        return Response({'message': f'{updated} отзывов одобрено.'})

    @action(detail=False, methods=['post'], url_path='bulk-reject')
    def bulk_reject(self, request):
        ids = request.data.get('ids', [])
        updated = Review.objects.filter(id__in=ids).update(is_approved=False)
        return Response({'message': f'{updated} отзывов отклонено.'})
