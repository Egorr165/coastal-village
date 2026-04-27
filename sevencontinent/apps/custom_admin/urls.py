from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_bookings import AdminBookingViewSet
from .views_cottages import AdminCottageViewSet, AdminCottageImageViewSet
from .views_reviews import AdminReviewViewSet
from .views_misc import AdminUserViewSet, AdminContactRequestViewSet, AdminStatsView, AdminDashboardStatsView

router = DefaultRouter()
router.register(r'bookings', AdminBookingViewSet, basename='admin-bookings')
router.register(r'cottages', AdminCottageViewSet, basename='admin-cottages')
router.register(r'cottage-images', AdminCottageImageViewSet, basename='admin-cottage-images')
router.register(r'reviews', AdminReviewViewSet, basename='admin-reviews')
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'contacts', AdminContactRequestViewSet, basename='admin-contacts')

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('', include(router.urls)),
]
