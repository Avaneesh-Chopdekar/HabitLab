from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import EmailOTP

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        self.email = "test@test.com"
        self.password = "@Password123"

    # 🚀 REGISTER

    @patch("accounts.views.send_otp_email")
    def test_register_sends_otp(self, mock_send_email):
        url = "/api/auth/register/"

        res = self.client.post(
            url, {"email": self.email, "username": "test", "password": self.password}
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        user = User.objects.get(email=self.email)
        self.assertFalse(user.is_verified)

        otp = EmailOTP.objects.filter(user=user).first()
        self.assertIsNotNone(otp)

        mock_send_email.assert_called_once()

    # 🔐 VERIFY OTP

    def test_verify_otp_success(self):
        user = User.objects.create_user(
            email=self.email, username="test", password=self.password, is_verified=False
        )

        EmailOTP.objects.create(user=user, code="123456")

        url = "/api/auth/verify-otp/"

        res = self.client.post(url, {"email": self.email, "otp": "123456"})

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.is_verified)

    def test_verify_otp_invalid(self):
        user = User.objects.create_user(
            email=self.email, username="test", password=self.password, is_verified=False
        )

        url = "/api/auth/verify-otp/"

        res = self.client.post(url, {"email": self.email, "otp": "wrong"})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # 🔁 RESEND OTP

    @patch("accounts.views.send_otp_email")
    def test_resend_otp_success(self, mock_send_email):
        user = User.objects.create_user(
            email=self.email, username="test", password=self.password
        )

        url = "/api/auth/resend-otp/"

        res = self.client.post(url, {"email": self.email})

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        otp = EmailOTP.objects.filter(user=user).first()
        self.assertIsNotNone(otp)

        mock_send_email.assert_called_once()

    @patch("accounts.views.send_otp_email")
    def test_resend_otp_rate_limit(self, mock_send_email):
        user = User.objects.create_user(
            email=self.email, username="test", password=self.password
        )

        EmailOTP.objects.create(user=user, code="123456")

        url = "/api/auth/resend-otp/"

        res = self.client.post(url, {"email": self.email})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # 🔑 LOGIN (JWT)

    def test_login_success(self):
        user = User.objects.create_user(
            email=self.email, username="test", password=self.password, is_verified=True
        )

        url = "/api/auth/login/"

        res = self.client.post(url, {"email": self.email, "password": self.password})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    # 👤 ME

    def test_me_view(self):
        user = User.objects.create_user(
            email=self.email, username="test", password=self.password, is_verified=True
        )

        self.client.force_authenticate(user=user)

        url = "/api/auth/me/"

        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], self.email)

    @patch("accounts.views.verify_google_token")
    def test_google_login_new_user(self, mock_verify):
        mock_verify.return_value = {"sub": "google123", "email": "google@test.com"}

        url = "/api/auth/google/"

        res = self.client.post(url, {"token": "fake"})

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        user = User.objects.get(email="google@test.com")
        self.assertEqual(user.google_sub, "google123")
