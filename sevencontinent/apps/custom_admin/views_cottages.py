from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.cottages.models import Cottage, CottageImage
from .serializers import AdminCottageSerializer, AdminCottageImageSerializer
from .permissions import IsAdminUser

class AdminCottageViewSet(viewsets.ModelViewSet):
    queryset = Cottage.objects.all().order_by('id')
    serializer_class = AdminCottageSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No ids provided'}, status=status.HTTP_400_BAD_REQUEST)
        Cottage.objects.filter(id__in=ids).delete()
        return Response({'status': 'deleted'})


class AdminCottageImageViewSet(viewsets.ModelViewSet):
    queryset = CottageImage.objects.all().order_by('display_order', '-is_main', '-created_at')
    serializer_class = AdminCottageImageSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        house_type = self.request.query_params.get('house_type')
        if house_type:
            queryset = queryset.filter(house_type=house_type)
        return queryset

    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        house_type = request.data.get('house_type')
        images = request.FILES.getlist('images')
        
        if not house_type or not images:
            return Response({'error': 'house_type and images are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        created_images = []
        for img in images:
            obj = CottageImage.objects.create(house_type=house_type, image=img)
            created_images.append(obj)
            
        # Возвращаем созданные объекты
        serializer = self.get_serializer(created_images, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='set-main')
    def set_main(self, request, pk=None):
        img = self.get_object()
        # Сбрасываем is_main у всех фото этого типа домика
        CottageImage.objects.filter(house_type=img.house_type, is_main=True).update(is_main=False)
        img.is_main = True
        img.save()
        return Response({'message': 'Main image updated successfully.'})

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        order_data = request.data.get('order', [])
        if not order_data:
            return Response({'error': 'No order data provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        for item in order_data:
            img_id = item.get('id')
            display_order = item.get('display_order')
            if img_id is not None and display_order is not None:
                CottageImage.objects.filter(id=img_id).update(display_order=display_order)
                
        return Response({'status': 'reordered'})

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No ids provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # When bulk deleting, the post_delete signal in models.py will trigger for each
        # IF we iterate and delete. Queryset `.delete()` does NOT trigger `post_delete` signals by default in bulk!
        # So we MUST loop and delete them 1 by 1 so the filesystem images are removed.
        images = CottageImage.objects.filter(id__in=ids)
        deleted_count = 0
        for img in images:
            img.delete()
            deleted_count += 1
            
        return Response({'deleted': deleted_count, 'message': 'Images deleted successfully'})
