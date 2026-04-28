from django.utils import timezone


def calculate_average(checkins):
    total = len(checkins)

    def avg(field):
        return sum(getattr(c, field) for c in checkins) / total

    def avg_nullable(field):
        values = [getattr(c, field) for c in checkins if getattr(c, field) is not None]
        return sum(values) / len(values) if values else 0

    return {
        "sleep_score": avg("sleep_score"),
        "mood_score": avg("mood_score"),
        "focus_score": avg("focus_score"),
        "phone_hours": avg("phone_hours"),
        "exercise_score": avg("exercise_score"),
        "confidence_score": avg("confidence"),
        "steps_avg": avg_nullable("steps"),
        "active_minutes_avg": avg_nullable("active_minutes"),
        "sleep_avg": avg_nullable("sleep_hours"),
    }


def calculate_streak(exp):
    checkins = exp.checkins.order_by("-completed_at")

    streak = 0
    prev = None

    for c in checkins:
        date = c.completed_at.date()

        if not prev:
            streak = 1
        else:
            if (prev - date).days == 1:
                streak += 1
            else:
                break

        prev = date

    return streak


def check_missed_days(exp):
    if not exp.last_checkin_at:
        return False

    diff = (timezone.now() - exp.last_checkin_at).days

    return diff > 3


def missed_days_flag(exp):
    if not exp.last_checkin_at:
        return False

    return (timezone.now() - exp.last_checkin_at).days > 3


def calculate_daily_scores(checkins):
    scores = []

    for c in checkins:
        score = calculate_habit_score(
            {
                "sleep_score": c.sleep_score,
                "focus_score": c.focus_score,
                "mood_score": c.mood_score,
                "exercise_score": c.exercise_score,
                "phone_hours": c.phone_hours,
                "confidence": c.confidence,
            }
        )

        scores.append({"day": c.day_number, "score": score})

    return scores


def calculate_habit_score(data):
    return round(
        (
            data["sleep_score"]
            + data["mood_score"]
            + data["focus_score"]
            + data["exercise_score"]
            - data["phone_hours"]  # negative factor
        )
        / 5,
        2,
    )


def calculate_life_scores(data):
    mind = (data["mood_score"] + data["focus_score"]) / 2

    body = (data["sleep_score"] + data["exercise_score"]) / 2

    discipline = 10 - data["phone_hours"]  # lower phone = higher discipline

    return {
        "mind": round(mind, 1),
        "body": round(body, 1),
        "discipline": round(discipline, 1),
    }
