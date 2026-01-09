from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .google import verify_google_token
from .models import User
from .serializers import RegisterSerializer
from .tokens import MyTokenSerializer

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer

class LoginView(TokenObtainPairView):
    serializer_class = MyTokenSerializer

class GoogleLogin(APIView):
    def post(self, request):
        token = request.data["token"]

        data = verify_google_token(token)

        email = data["email"]
        name = data.get("name", "labrat")

        user, _ = User.objects.get_or_create(
            email=email,
            defaults={"username": email.split("@")[0]}
        )

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        })