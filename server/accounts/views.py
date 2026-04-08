from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from experiments.models import Baseline

from .google import verify_google_token
from .helper import generate_otp, issue_jwt, send_otp_email
from .models import EmailOTP, User
from .serializers import RegisterSerializer
from .tokens import MyTokenSerializer


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save(is_verified=False)

        EmailOTP.objects.filter(user=user).delete()

        otp = generate_otp()
        EmailOTP.objects.create(user=user, code=otp)

        send_otp_email(user.email, otp)

        return Response({"message": "OTP sent to email"})


class LoginView(TokenObtainPairView):
    serializer_class = MyTokenSerializer


class GoogleLogin(APIView):
    def post(self, request):
        token = request.data["token"]
        data = verify_google_token(token)

        google_sub = data["sub"]
        email = data["email"]

        # Case 1: Google already linked
        user = User.objects.filter(google_sub=google_sub).first()
        if user:
            return issue_jwt(user)

        # Case 2: Email exists so, link Google
        user = User.objects.filter(email=email).first()
        if user:
            user.google_sub = google_sub
            user.save()
            return issue_jwt(user)

        # Case 3: New user
        user = User.objects.create(
            email=email, username=email.split("@")[0], google_sub=google_sub
        )

        return issue_jwt(user)


class VerifyOTP(APIView):
    def post(self, request):
        email = request.data["email"]
        code = request.data["otp"]

        user = User.objects.get(email=email)
        otp = EmailOTP.objects.filter(user=user, code=code).first()

        if not otp:
            return Response({"error": "Invalid OTP"}, status=400)

        if otp.is_expired():
            otp.delete()
            return Response({"error": "OTP expired"}, status=400)

        user.is_verified = True
        user.save()

        Baseline.objects.get_or_create(
            user=user,
            defaults={
                "sleep_score": 0,
                "mood_score": 0,
                "focus_score": 0,
                "phone_hours": 0,
                "exercise_score": 0,
                "confidence_score": 0,
            },
        )

        otp.delete()

        return issue_jwt(user)


class ResendOTP(APIView):
    def post(self, request):
        email = request.data["email"]
        user = User.objects.get(email=email)

        last = EmailOTP.objects.filter(user=user).order_by("-created_at").first()

        if last:
            diff = (timezone.now() - last.created_at).seconds
            if diff < 60:
                return Response({"error": f"Wait {60 - diff} seconds"}, status=400)

        EmailOTP.objects.filter(user=user).delete()

        otp = generate_otp()
        EmailOTP.objects.create(user=user, code=otp)
        send_otp_email(user.email, otp)

        return Response({"message": "OTP resent"})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "is_verified": user.is_verified,
            }
        )
