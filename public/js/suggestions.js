// public/js/suggestions.js

/**
 * Generate an array of suggestions based on:
 *  - how many tasks remain
 *  - how many pomodoro sessions done today
 */
export function getSuggestions(incompleteTasks, sessionsToday) {
  const tips = [];

  if (incompleteTasks === 0) {
    tips.push("🎉 All done! Great job clearing your tasks today.");
  } else if (incompleteTasks <= 3) {
    tips.push(
      `Only ${incompleteTasks} task(s) left—power through with a focused Pomodoro!`
    );
  } else {
    tips.push(
      `You have ${incompleteTasks} tasks remaining. Try tackling the top 3 first.`
    );
  }

  if (sessionsToday === 0) {
    tips.push(
      "🍅 You haven't started a Pomodoro yet—give it a go to build momentum."
    );
  } else if (sessionsToday < 3) {
    tips.push(
      `👍 You've completed ${sessionsToday} session(s) today. Keep the streak going!`
    );
  } else {
    tips.push(
      "🔥 On fire! You're on a roll—consider taking a longer break soon."
    );
  }

  // You can add timed reminders, motivational quotes, etc.
  return tips;
}
