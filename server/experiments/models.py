from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Baseline(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    sleep_score = models.FloatField(default=0)
    mood_score = models.FloatField(default=0)
    focus_score = models.FloatField(default=0)
    phone_hours = models.FloatField(default=0)
    exercise_score = models.FloatField(default=0)
    confidence_score = models.FloatField(default=0)

    updated_at = models.DateTimeField(auto_now=True)


class ExperimentTemplate(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    default_duration = models.IntegerField(default=7)
    difficulty = models.IntegerField(default=1)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class UserExperiment(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("paused", "Paused"),
        ("completed", "Completed"),
        ("abandoned", "Abandoned"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=255)
    template = models.ForeignKey(
        ExperimentTemplate, null=True, blank=True, on_delete=models.SET_NULL
    )

    duration_days = models.IntegerField()
    difficulty = models.IntegerField(default=1)

    start_date = models.DateField(auto_now_add=True)
    last_checkin_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    baseline_snapshot = models.JSONField()
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=Q(status="active"),
                name="one_active_experiment_per_user",
            )
        ]


class DailyCheckin(models.Model):
    user_experiment = models.ForeignKey(
        UserExperiment, on_delete=models.CASCADE, related_name="checkins"
    )

    day_number = models.IntegerField()

    completed_at = models.DateTimeField(default=timezone.now)

    confidence = models.FloatField(default=0)

    sleep_score = models.FloatField()
    mood_score = models.FloatField()
    focus_score = models.FloatField()
    phone_hours = models.FloatField()
    exercise_score = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)


class ExperimentResult(models.Model):
    user_experiment = models.OneToOneField(UserExperiment, on_delete=models.CASCADE)

    baseline = models.JSONField()
    final_avg = models.JSONField()
    summary = models.TextField()

    life_score_before = models.JSONField(default=dict)
    life_score_after = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
