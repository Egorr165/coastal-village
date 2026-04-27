from rest_framework import serializers
from apps.bookings.models import Booking
from apps.cottages.models import Cottage, CottageImage

class AdminBookingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    cottage_name = serializers.CharField(source='cottage.title', read_only=True)
    cottage_type = serializers.CharField(source='cottage.house_type', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_name', 'user_first_name', 'user_last_name', 'user_email', 'cottage', 'cottage_name', 'cottage_type',
            'check_in_date', 'check_out_date', 'guests_count', 'extra_bed_count', 
            'total_price', 'status', 'special_requests', 'created_at', 'updated_at'
        ]

class AdminCottageSerializer(serializers.ModelSerializer):
    bookedRanges = serializers.SerializerMethodField()

    class Meta:
        model = Cottage
        fields = '__all__'

    def get_bookedRanges(self, obj):
        from apps.bookings.models import Booking
        active_bookings = obj.bookings.exclude(status__in=[Booking.StatusChoices.CANCELLED, Booking.StatusChoices.COMPLETED])
        return [
            {
                'startDate': b.check_in_date.isoformat(),
                'endDate': b.check_out_date.isoformat()
            } for b in active_bookings
        ]

class AdminCottageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CottageImage
        fields = '__all__'

from apps.reviews.models import Review
class AdminReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    cottage_name = serializers.CharField(source='cottage.title', read_only=True)
    class Meta:
        model = Review
        fields = '__all__'

from apps.accounts.models import User
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'date_joined']

from apps.contacts.models import ContactRequest
class AdminContactRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = '__all__'
