from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer
)

import random
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailVerificationCode
from rest_framework.views import APIView

def generate_code():
    return f"{random.randint(100000, 999999)}"

def send_verification_email(user, code, purpose='register'):
    # In a real setup, this would be an HTML template.
    if purpose == 'register':
        subject = 'Подтверждение регистрации (7 Континент)'
        message = f'Здравствуйте, {user.first_name}!\n\nВаш код подтверждения для завершения регистрации: {code}\n\nНикому не сообщайте этот код.'
    else:
        subject = 'Сброс пароля (7 Континент)'
        message = f'Здравствуйте, {user.first_name}!\n\nВаш код для сброса пароля: {code}\n\nЕсли вы не запрашивали сброс, проигнорируйте это письмо.'
    
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') and settings.EMAIL_HOST_USER else 'noreply@example.com',
        [user.email],
        fail_silently=False,
    )

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_active = False  # Deactivate until verified
        user.is_verified = False
        user.save()
        
        # Create and send code
        code = generate_code()
        EmailVerificationCode.objects.create(user=user, code=code, purpose=EmailVerificationCode.PURPOSE_REGISTER)
        send_verification_email(user, code, 'register')
        
        return Response({
            'message': 'Код подтверждения отправлен на почту',
            'email': user.email
        }, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        try:
            user = User.objects.get(email=email)
            verification = EmailVerificationCode.objects.filter(
                user=user, 
                code=code, 
                purpose=EmailVerificationCode.PURPOSE_REGISTER
            ).first() # gets the latest code due to Meta ordering=['-created_at']

            if not verification:
                return Response({'error': 'Неверный код'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Here we could also check created_at for expiration (e.g. 15 mins)
            
            user.is_active = True
            user.is_verified = True
            user.save()
            verification.delete()

            # Auto login the user
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Регистрация успешно завершена'
            })
            
        except User.DoesNotExist:
            return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            code = generate_code()
            EmailVerificationCode.objects.create(user=user, code=code, purpose=EmailVerificationCode.PURPOSE_RESET)
            send_verification_email(user, code, 'reset_password')
            return Response({'message': 'Код для сброса пароля отправлен'})
        except User.DoesNotExist:
            # For security, we can return success even if user doesn't exist
            return Response({'message': 'Код для сброса пароля отправлен'})

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(email=email)
            verification = EmailVerificationCode.objects.filter(
                user=user, 
                code=code, 
                purpose=EmailVerificationCode.PURPOSE_RESET
            ).first()

            if not verification:
                return Response({'error': 'Неверный код'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            verification.delete()

            return Response({'message': 'Пароль успешно изменен'})
        except User.DoesNotExist:
            return Response({'error': 'Ошибка'}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        if not user.is_verified:
            # If for some reason they exist but not verified
            pass # They can't reach here because is_active=False blocks authentication in default backend!
            
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user, context={'request': request}).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Вход выполнен успешно'
        })

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
