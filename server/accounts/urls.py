from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from accounts.views import RegisterView, GoogleLogin, VerifyOTP, ResendOTP

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("verify-otp/", VerifyOTP.as_view()),
    path("resend-otp/", ResendOTP.as_view()),
    path('login/', TokenObtainPairView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
    path("google/", GoogleLogin.as_view()),
]