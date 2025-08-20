// public/js/timer.js

let timerInterval = null;
let remainingSec = 0;

// Default config (in minutes & sessions)
let config = {
  workLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  sessionsBeforeLong: 4,
};

let state = "work"; // "work" | "shortBreak" | "longBreak"
let workCount = 0; // completed work sessions

/**
 * Format seconds as "MM:SS"
 */
export function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Initialize the Pomodoro state machine.
 *
 * @param {{
 *   onTick: (secsLeft: number, state: string) => void,
 *   onWorkComplete: (durationSec: number) => void,
 *   onBreakComplete: (breakState: string) => void
 * }} callbacks
 * @param {{
 *   workLength?: number,
 *   shortBreakLength?: number,
 *   longBreakLength?: number,
 *   sessionsBeforeLong?: number
 * }} userConfig
 */
export function initTimer(
  { onTick, onWorkComplete, onBreakComplete },
  userConfig = {}
) {
  // Merge config
  config = { ...config, ...userConfig };
  workCount = 0;
  transitionTo("work", onTick);

  // Start
  document.getElementById("start-btn")?.addEventListener("click", () => {
    if (timerInterval) return;
    const endTime = Date.now() + remainingSec * 1000;
    timerInterval = setInterval(() => {
      const secsLeft = Math.round((endTime - Date.now()) / 1000);
      if (secsLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;

        if (state === "work") {
          workCount += 1;
          onWorkComplete(config.workLength * 60);
          // Next is break
          const next =
            workCount % config.sessionsBeforeLong === 0
              ? "longBreak"
              : "shortBreak";
          transitionTo(next, onTick);
        } else {
          onBreakComplete(state);
          transitionTo("work", onTick);
        }
      } else {
        remainingSec = secsLeft;
        onTick(secsLeft, state);
      }
    }, 1000);
  });

  // Pause
  document.getElementById("pause-btn")?.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
  });

  // Reset
  document.getElementById("reset-btn")?.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    workCount = 0;
    transitionTo("work", onTick);
  });
}

/**
 * Transition into a state and reset remainingSec
 */
function transitionTo(newState, onTick) {
  state = newState;
  switch (state) {
    case "work":
      remainingSec = config.workLength * 60;
      break;
    case "shortBreak":
      remainingSec = config.shortBreakLength * 60;
      break;
    case "longBreak":
      remainingSec = config.longBreakLength * 60;
      break;
  }
  onTick(remainingSec, state);
}
/**
 * Return how many seconds remain in the current interval.
 */
export function getRemaining() {
  return remainingSec;
}
