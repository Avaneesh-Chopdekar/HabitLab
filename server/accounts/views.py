from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .google import verify_google_token
from .helper import issue_jwt
from .models import User
from .serializers import RegisterSerializer
from .tokens import MyTokenSerializer

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer

class LoginView(TokenObtainPairView):
    serializer_class = MyTokenSerializer

# accounts/views.py
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
            email=email,
            username=email.split("@")[0],
            google_sub=google_sub
        )

        return issue_jwt(user)
