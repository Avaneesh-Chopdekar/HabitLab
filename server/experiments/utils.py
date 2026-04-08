from datetime import timedelta

from django.utils import timezone


def calculate_average(checkins):
    total = len(checkins)

    def avg(field):
        return sum(getattr(c, field) for c in checkins) / total

    return {
        "sleep_score": avg("sleep_score"),
        "mood_score": avg("mood_score"),
        "focus_score": avg("focus_score"),
        "phone_hours": avg("phone_hours"),
        "exercise_score": avg("exercise_score"),
        "confidence_score": avg("confidence"),
    }


def generate_summary(baseline, final):
    improvements = []

    def diff(key):
        return round(final[key] - baseline[key], 2)

    # Positive metrics
    if diff("sleep_score") > 1:
        improvements.append("Your sleep quality improved significantly.")
    elif diff("sleep_score") > 0:
        improvements.append("Your sleep quality improved slightly.")

    if diff("focus_score") > 1:
        improvements.append("You became much more focused.")
    elif diff("focus_score") > 0:
        improvements.append("Your focus improved.")

    if diff("mood_score") > 1:
        improvements.append("Your mood improved a lot.")
    elif diff("mood_score") > 0:
        improvements.append("Your mood improved.")

    if diff("exercise_score") > 1:
        improvements.append("You became more active physically.")
    elif diff("exercise_score") > 0:
        improvements.append("Your activity level improved.")

    # Negative metric (phone)
    if diff("phone_hours") < -1:
        improvements.append("You reduced screen time significantly.")
    elif diff("phone_hours") < 0:
        improvements.append("You reduced screen time.")

    if not improvements:
        return "Your performance stayed consistent. Try adjusting your experiment for better results."

    return "\n".join(f"• {i}" for i in improvements)


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
