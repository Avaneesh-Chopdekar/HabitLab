from rest_framework import serializers


class StartExperimentSerializer(serializers.Serializer):
    title = serializers.CharField(required=False)
    template_id = serializers.IntegerField(required=False)
    duration_days = serializers.IntegerField(min_value=3, max_value=30, required=False)


class CheckinSerializer(serializers.Serializer):
    confidence = serializers.FloatField(min_value=0, max_value=10)

    sleep_score = serializers.FloatField()
    mood_score = serializers.FloatField()
    focus_score = serializers.FloatField()
    phone_hours = serializers.FloatField()
    exercise_score = serializers.FloatField()
