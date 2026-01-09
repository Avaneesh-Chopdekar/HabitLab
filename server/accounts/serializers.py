import re
from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "username", "password"]

    def validate_email(self, value):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Invalid email")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password too short")
        if len(value) > 128:
            raise serializers.ValidationError("Password too long")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Must contain uppercase")
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Must contain lowercase")
        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Must contain a number")
        return value

    def create(self, data):
        return User.objects.create_user(**data)
