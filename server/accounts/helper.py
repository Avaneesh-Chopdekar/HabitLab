from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


def issue_jwt(user):
    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })
