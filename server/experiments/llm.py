import json
import os
from typing import Any

from groq import Groq

# ── Groq client ───────────────────────────────────────────────────────────────

GROQ_MODEL = "llama-3.3-70b-versatile"

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def ask_groq(prompt: str, expect_json: bool = False) -> Any:
    """
    Send a prompt to Groq and return the response.
    Set expect_json=True to parse the response as JSON automatically.
    Raises RuntimeError on failure so callers can fall back gracefully.
    """
    try:
        kwargs = {
            "messages": [{"role": "user", "content": prompt}],
            "model": GROQ_MODEL,
        }

        if expect_json:
            kwargs["response_format"] = {"type": "json_object"}

        chat_completion = client.chat.completions.create(**kwargs)
        text = chat_completion.choices[0].message.content.strip()

        if expect_json:
            return json.loads(text)

        return text

    except json.JSONDecodeError as e:
        raise RuntimeError(f"Groq response parse error: {e}")
    except Exception as e:
        raise RuntimeError(f"Groq error: {e}")


# ── Use-case 1: generate_summary ─────────────────────────────────────────────


def generate_summary(baseline: dict, final: dict) -> str:
    """
    Use Groq to generate a personalised, encouraging experiment summary.
    Falls back to the rule-based version if Groq is unavailable.
    """

    def delta(key):
        return round(final.get(key, 0) - baseline.get(key, 0), 2)

    changes = {
        "sleep_score": delta("sleep_score"),
        "focus_score": delta("focus_score"),
        "mood_score": delta("mood_score"),
        "exercise_score": delta("exercise_score"),
        "phone_hours": delta("phone_hours"),  # negative = improvement
        "confidence_score": delta("confidence_score"),
    }

    baseline_fmt = "\n".join(
        f"  - {k.replace('_', ' ').title()}: {round(v, 2)}"
        for k, v in baseline.items()
        if k in changes
    )
    final_fmt = "\n".join(
        f"  - {k.replace('_', ' ').title()}: {round(v, 2)}"
        for k, v in final.items()
        if k in changes
    )
    changes_fmt = "\n".join(
        f"  - {k.replace('_', ' ').title()}: {'+' if v >= 0 else ''}{v}"
        for k, v in changes.items()
    )

    prompt = f"""You are a warm, encouraging personal habit coach writing a short summary for someone who just completed a habit experiment. Your tone should be motivating, honest, and easy to understand for both teenagers and elderly people. Use simple words. No jargon.

Here is the data from their experiment:

BASELINE (before the experiment):
{baseline_fmt}

FINAL AVERAGES (after the experiment):
{final_fmt}

NET CHANGES (positive = improved, negative = declined, except phone_hours where negative = improved):
{changes_fmt}

Note: All scores are on a scale of 0-10. Phone hours is the number of hours spent on phone per day (lower is better).

Write a personalised summary with these rules:
1. Start with one warm congratulatory sentence (mention at least one specific win if any exist).
2. Then write 3-5 bullet points. Each bullet should mention a specific metric, the direction it moved, and a one-line human interpretation of what that means in real life.
3. If something declined, be gentle — frame it as an opportunity, not a failure.
4. End with one short motivating sentence encouraging them to keep going or try the next experiment.
5. Use plain bullet points starting with •
6. Keep each bullet under 20 words.
7. Do NOT use markdown headers, bold text, or asterisks.
8. Total response should be under 150 words.

Write only the summary. No preamble."""

    try:
        return ask_groq(prompt)
    except RuntimeError:
        return _fallback_summary(changes)


def _fallback_summary(changes: dict) -> str:
    points = []
    if changes["sleep_score"] > 1:
        points.append("Your sleep quality improved significantly.")
    elif changes["sleep_score"] > 0:
        points.append("Your sleep quality improved slightly.")
    if changes["focus_score"] > 1:
        points.append("You became much more focused.")
    elif changes["focus_score"] > 0:
        points.append("Your focus improved.")
    if changes["mood_score"] > 1:
        points.append("Your mood improved a lot.")
    elif changes["mood_score"] > 0:
        points.append("Your mood improved.")
    if changes["exercise_score"] > 0:
        points.append("Your physical activity level improved.")
    if changes["phone_hours"] < -1:
        points.append("You reduced screen time significantly.")
    elif changes["phone_hours"] < 0:
        points.append("You reduced screen time.")
    if not points:
        return "Your performance stayed consistent. Try adjusting your experiment for better results."
    return "\n".join(f"• {p}" for p in points)


# ── Use-case 2: suggest_sub_experiments ──────────────────────────────────────


def suggest_sub_experiments(title: str) -> list[str]:
    """
    Use Groq to suggest relevant sub-experiments for a given experiment title.
    Falls back to keyword matching if Groq is unavailable.
    """

    # Note: json_object mode requires the word "JSON" in the prompt
    prompt = f"""You are a smart personal habit coach helping someone design a self-improvement experiment.

The user wants to run an experiment called: "{title}"

Suggest 4 specific, measurable daily habits they should track. These are called sub-experiments.

Rules:
1. Each should be a short, actionable daily habit (2-5 words max).
2. Must be directly relevant to the experiment title.
3. Should be measurable on a 0-10 scale each day.
4. Avoid vague suggestions like "Be healthier".

Examples:
- "Morning workout routine" → ["Morning workout done", "Protein intake", "Step count", "Energy level"]
- "Read more books" → ["Pages read", "Distraction-free time", "Notes taken", "Focus quality"]
- "8km morning run" → ["Run completed", "Distance covered", "Energy after run", "Sleep quality"]

Return a JSON object with a single key "suggestions" containing an array of exactly 4 strings.
Experiment title: "{title}"
"""

    try:
        result = ask_groq(prompt, expect_json=True)
        suggestions = result.get("suggestions", [])
        if isinstance(suggestions, list) and all(
            isinstance(s, str) for s in suggestions
        ):
            return suggestions[:4]
        raise ValueError("Unexpected format")
    except RuntimeError, ValueError, AttributeError:
        return _fallback_suggestions(title)


def _fallback_suggestions(title: str) -> list[str]:
    t = title.lower()
    if "interview" in t:
        return ["DSA practice", "System Design", "Project work", "CS Fundamentals"]
    elif "fitness" in t or "workout" in t or "run" in t or "gym" in t:
        return ["Workout done", "Step count", "Diet quality", "Sleep quality"]
    elif "focus" in t or "deep work" in t:
        return [
            "Deep work hours",
            "No phone time",
            "Daily planning",
            "End-of-day review",
        ]
    elif "study" in t or "learn" in t:
        return ["Pages read", "Revision done", "Practice problems", "Notes taken"]
    elif "sleep" in t:
        return [
            "Bedtime consistency",
            "Screen-free hour",
            "Sleep hours",
            "Morning energy",
        ]
    elif "diet" in t or "food" in t or "nutrition" in t:
        return ["Water intake", "Healthy meals", "Junk avoided", "Calorie awareness"]
    elif "meditat" in t or "mindful" in t:
        return [
            "Meditation done",
            "Stress level",
            "Breathing exercises",
            "Present moments",
        ]
    else:
        return ["Daily consistency", "Mood tracking", "Focus quality", "Sleep quality"]
