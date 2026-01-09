import random

from django.conf import settings
from django.core.mail import send_mail
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken



def issue_jwt(user):
    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(email, otp):
    send_mail(
        "HabitLab – Verify your email",
        f"Your HabitLab verification code is: {otp}",
        settings.EMAIL_HOST_USER,
        [email],
    )
