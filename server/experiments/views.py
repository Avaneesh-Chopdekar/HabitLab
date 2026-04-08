from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .helper import api_response, is_testing
from .models import (
    Baseline,
    DailyCheckin,
    ExperimentResult,
    ExperimentTemplate,
    UserExperiment,
)
from .serializers import CheckinSerializer, StartExperimentSerializer
from .utils import (
    calculate_average,
    calculate_daily_scores,
    calculate_life_scores,
    calculate_streak,
    generate_summary,
    missed_days_flag,
)


class StartExperimentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StartExperimentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        if UserExperiment.objects.filter(user=user, status="active").exists():
            return Response(
                api_response(False, error="Active experiment exists"), status=400
            )

        template = None
        title = serializer.validated_data.get("title")
        duration = serializer.validated_data.get("duration_days", 7)

        if is_testing():
            duration = min(duration, 2)  # force short experiments

        difficulty = 1

        if "template_id" in serializer.validated_data:
            template = ExperimentTemplate.objects.get(
                id=serializer.validated_data["template_id"]
            )
            title = template.title
            duration = template.default_duration
            difficulty = template.difficulty

        baseline, _ = Baseline.objects.get_or_create(user=user)

        exp = UserExperiment.objects.create(
            user=user,
            title=title,
            template=template,
            duration_days=duration,
            difficulty=difficulty,
            baseline_snapshot={
                "sleep_score": baseline.sleep_score,
                "mood_score": baseline.mood_score,
                "focus_score": baseline.focus_score,
                "phone_hours": baseline.phone_hours,
                "exercise_score": baseline.exercise_score,
                "confidence_score": baseline.confidence_score,
            },
        )

        return Response(api_response(True, {"id": exp.pk}))


class ToggleExperimentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exp = UserExperiment.objects.filter(user=request.user, status="active").first()

        if not exp:
            exp = UserExperiment.objects.filter(
                user=request.user, status="paused"
            ).first()

            if not exp:
                return Response(
                    api_response(False, error="No experiment found"), status=404
                )

            exp.status = "active"
            exp.save()
            return Response(api_response(True, {"status": "resumed"}))

        exp.status = "paused"
        exp.save()
        return Response(api_response(True, {"status": "paused"}))


class DailyCheckinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        exp = UserExperiment.objects.filter(user=user, status="active").first()

        if not exp:
            return Response(
                api_response(False, error="No active experiment"), status=400
            )

        offset = 0

        if is_testing():
            offset = int(request.data.get("debug_day_offset", 0))

        today = timezone.now().date() + timedelta(days=offset)

        if not is_testing():
            if DailyCheckin.objects.filter(
                user_experiment=exp, completed_at__date=today
            ).exists():
                return Response(
                    api_response(False, error="Already checked in today"), status=400
                )

        day_number = DailyCheckin.objects.filter(user_experiment=exp).count() + 1

        if is_testing():
            print(f"[TEST MODE] Day number: {day_number}")

        DailyCheckin.objects.create(
            user_experiment=exp, day_number=day_number, **serializer.validated_data
        )

        exp.last_checkin_at = timezone.now()
        exp.save()

        if day_number >= exp.duration_days:
            checkins = DailyCheckin.objects.filter(user_experiment=exp)

            final_avg = calculate_average(checkins)
            baseline = exp.baseline_snapshot

            life_before = calculate_life_scores(baseline)
            life_after = calculate_life_scores(final_avg)

            summary = generate_summary(baseline, final_avg)

            ExperimentResult.objects.create(
                user_experiment=exp,
                baseline=baseline,
                final_avg=final_avg,
                life_score_before=life_before,
                life_score_after=life_after,
                summary=summary,
            )

            exp.status = "completed"
            exp.save()

            base, _ = Baseline.objects.get_or_create(user=user)
            for key, value in final_avg.items():
                setattr(base, key, value)
            base.save()

            return Response(api_response(True, {"completed": True}))

        return Response(api_response(True, {"completed": False}))


class ExperimentResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exp_id):
        experiment = UserExperiment.objects.filter(id=exp_id).first()

        result = ExperimentResult.objects.filter(user_experiment_id=exp_id).first()

        if not result:
            return Response(api_response(False, error="Result not found"), status=404)

        checkins = DailyCheckin.objects.filter(user_experiment_id=exp_id).order_by(
            "day_number"
        )

        daily_scores = calculate_daily_scores(checkins)

        return Response(
            api_response(
                True,
                {
                    "title": experiment.title,
                    "baseline": result.baseline,
                    "final": result.final_avg,
                    "summary": result.summary,
                    "score_before": result.life_score_before,
                    "score_after": result.life_score_after,
                    "daily_scores": daily_scores,
                },
            )
        )


class CurrentExperimentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        exp = UserExperiment.objects.filter(user=request.user, status="active").first()

        if not exp:
            return Response(api_response(True, {"active": False}))

        checkins = DailyCheckin.objects.filter(user_experiment=exp)
        count = checkins.count()

        progress = round((count / exp.duration_days) * 100, 2)
        streak = calculate_streak(exp)
        missed = missed_days_flag(exp)

        return Response(
            api_response(
                True,
                {
                    "active": True,
                    "id": exp.pk,
                    "title": exp.title,
                    "day": count + 1,
                    "duration": exp.duration_days,
                    "progress": progress,
                    "streak": streak,
                    "missed_days": missed,
                    "difficulty": exp.difficulty,
                },
            )
        )


class UpdateBaselineView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        baseline, _ = Baseline.objects.get_or_create(user=request.user)

        for field in [
            "sleep_score",
            "mood_score",
            "focus_score",
            "phone_hours",
            "exercise_score",
            "confidence_score",
        ]:
            if field in request.data:
                setattr(baseline, field, request.data[field])

        baseline.save()

        return Response(api_response(True, {"message": "Baseline updated"}))


class RestartExperimentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        exp = UserExperiment.objects.filter(user=request.user, status="active").first()

        if not exp:
            return Response(api_response(False, error="No active experiment"))

        exp.start_date = timezone.now().date()
        exp.last_checkin_at = None
        exp.status = "active"
        exp.save()

        exp.checkins.all().delete()

        return Response(api_response(True, {"reset": True}))


class UserExperimentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        exps = UserExperiment.objects.filter(user=request.user).order_by("-created_at")

        data = [
            {
                "id": e.pk,
                "title": e.title,
                "status": e.status,
                "duration": e.duration_days,
                "created_at": e.created_at,
            }
            for e in exps
        ]

        return Response(api_response(True, data))
