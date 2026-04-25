from rest_framework import serializers


class StartExperimentSerializer(serializers.Serializer):
    title = serializers.CharField(required=False)
    template_id = serializers.IntegerField(required=False)
    duration_days = serializers.IntegerField(required=False)

    sub_experiments = serializers.ListField(
        child=serializers.CharField(), required=False, allow_empty=True
    )

    class Meta:
        def validate(self, data):
            if not data.get("template_id") and not data.get("title"):
                raise serializers.ValidationError("Title or template required")
            return data


class CheckinSerializer(serializers.Serializer):
    confidence = serializers.FloatField(min_value=0, max_value=10)

    sleep_score = serializers.FloatField(allow_null=True)
    mood_score = serializers.FloatField()
    focus_score = serializers.FloatField()
    phone_hours = serializers.FloatField()
    exercise_score = serializers.FloatField(allow_null=True)

    steps = serializers.IntegerField(allow_null=True)
    active_minutes = serializers.IntegerField(allow_null=True)
    avg_heart_rate = serializers.FloatField(allow_null=True)
    sleep_hours = serializers.FloatField(allow_null=True)
    effort_score = serializers.FloatField(allow_null=True)
