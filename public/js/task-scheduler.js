import { loadTasks } from "./firestore.js";
import { initTimer } from "./timer.js";

async function scheduleTaskAlarms(uid) {
  const tasks = await loadTasks(uid);
  const now = new Date();

  tasks
    .filter((t) => t.active && t.scheduleTime) // only scheduled tasks
    .forEach((t) => {
      // parse today’s date + scheduleTime "HH:mm"
      const [hh, mm] = t.scheduleTime.split(":").map(Number);
      const alarmDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hh,
        mm,
        0
      );
      const msUntil = alarmDate - now;
      if (msUntil > 0) {
        setTimeout(() => onTaskAlarm(t), msUntil);
      }
    });
}

// Called when a scheduled task alarm fires
function onTaskAlarm(task) {
  // 1) Notify the user
  alert(`🔔 Time to start "${task.title}"!`);

  // 2) Navigate to the dashboard or a task detail page
  window.location.href = `task.html?id=${task.id}`;
}
