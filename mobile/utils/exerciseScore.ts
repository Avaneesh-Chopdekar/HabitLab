export function calculateAdaptiveExerciseScore({
  steps,
  activeMinutes,
  avgHeartRate,
  baseline,
}: {
  steps: number;
  activeMinutes: number;
  avgHeartRate: number;
  baseline: {
    steps_avg: number;
    active_minutes_avg: number;
  };
}) {
  // 🧠 relative improvement
  const stepsRatio = steps / (baseline.steps_avg || 3000);
  const activityRatio = activeMinutes / (baseline.active_minutes_avg || 20);

  // clamp (so it doesn't explode)
  const stepsScore = Math.min(10, stepsRatio * 5);
  const activityScore = Math.min(10, activityRatio * 5);

  // heart rate still absolute
  let hrScore = 0;
  if (avgHeartRate >= 140) hrScore = 10;
  else if (avgHeartRate >= 120) hrScore = 7;
  else if (avgHeartRate >= 100) hrScore = 4;
  else hrScore = 1;

  const finalScore = stepsScore * 0.4 + activityScore * 0.4 + hrScore * 0.2;

  return Math.round(finalScore);
}

export function calculateEffortScore({
  steps,
  activeMinutes,
  avgHeartRate,
}: {
  steps: number;
  activeMinutes: number;
  avgHeartRate: number;
}) {
  let effort = 0;

  // movement
  effort += Math.min(steps / 10000, 1) * 40;

  // duration
  effort += Math.min(activeMinutes / 60, 1) * 30;

  // intensity (THIS is key)
  if (avgHeartRate >= 150) effort += 30;
  else if (avgHeartRate >= 130) effort += 20;
  else if (avgHeartRate >= 110) effort += 10;

  return Math.round(effort); // out of 100
}
