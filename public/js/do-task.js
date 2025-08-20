// public/js/do-task.js

import { auth, db } from "../firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { initTimer, formatTime } from "./timer.js";
import { showLoading, hideLoading } from "./loading.js";

// URL params
const params = new URLSearchParams(location.search);
const taskId = params.get("id");

// Elements
const overlay = document.getElementById("loading-overlay");
const pageTitle = document.getElementById("task-title");
const taskDetailsEl = document.getElementById("task-details");
const cycleCounterEl = document.getElementById("cycle-counter");
const modeEl = document.getElementById("timer-mode");
const displayEl = document.getElementById("timer-display");
const progressEl = document.getElementById("timer-progress");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const bellSound = document.getElementById("bell-sound");
const bgMusic = document.getElementById("bg-music");
const toggleMusic = document.getElementById("toggle-music");
const completeBanner = document.getElementById("complete-banner");

let uid, taskData;

// Auth & fetch wrapped in loading spinner
onAuthStateChanged(auth, async (user) => {
  showLoading();
  try {
    if (!user) throw new Error("Not signed in");
    uid = user.uid;

    if (!taskId) {
      throw new Error("No task specified.");
    }

    const snap = await getDoc(doc(db, "users", uid, "tasks", taskId));
    if (!snap.exists()) {
      throw new Error("Task not found.");
    }
    taskData = snap.data();

    // Populate header
    pageTitle.textContent = taskData.title;
    taskDetailsEl.textContent = taskData.details || "";

    // Initialize the timer
    setupTimer();
  } catch (err) {
    alert(err.message);
    location.replace("dashboard.html");
  } finally {
    hideLoading();
  }
});

// Music toggle
toggleMusic.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    toggleMusic.textContent = "Pause Music";
  } else {
    bgMusic.pause();
    toggleMusic.textContent = "Play Music";
  }
});

// Disable all controls when complete
function disableControls() {
  [startBtn, pauseBtn, resetBtn, toggleMusic].forEach(
    (btn) => (btn.disabled = true)
  );
  bgMusic.pause();
}

// Timer setup with cycle tracking
function setupTimer() {
  const workSec = (taskData.workDuration || 25) * 60;
  const shortSec = (taskData.shortBreak || 5) * 60;
  const longSec = (taskData.longBreak || 15) * 60;
  const totalCycles = taskData.cycles || 1;

  let currentState = "work";
  let currentTotal = workSec;
  let workCompleted = 0;
  let isPaused = false;

  // Cycle counter
  const updateCycleCounter = () => {
    cycleCounterEl.textContent = `Cycle ${workCompleted + 1} of ${totalCycles}`;
  };
  updateCycleCounter();

  initTimer(
    {
      onTick: (secsLeft, state) => {
        // state transition
        if (state !== currentState) {
          currentState = state;
          currentTotal =
            state === "work"
              ? workSec
              : state === "shortBreak"
              ? shortSec
              : longSec;
          updateCycleCounter();
        }

        // update UI
        displayEl.textContent = formatTime(secsLeft);
        modeEl.textContent =
          state === "work"
            ? "Work"
            : state === "shortBreak"
            ? "Short Break"
            : "Long Break";

        const pct = ((currentTotal - secsLeft) / currentTotal) * 100;
        progressEl.value = isFinite(pct) ? pct : 0;

        startBtn.textContent = isPaused ? "Resume" : "Start";
      },

      onWorkComplete: async () => {
        bellSound.play();
        workCompleted++;
        if (workCompleted >= totalCycles) {
          // mark complete
          await updateDoc(doc(db, "users", uid, "tasks", taskId), {
            completed: true,
          });
          completeBanner.style.display = "block";
          disableControls();
          setTimeout(() => location.replace("dashboard.html"), 3000);
        }
      },

      onBreakComplete: () => {
        bellSound.play();
      },
    },
    {
      workLength: taskData.workDuration || 25,
      shortBreakLength: taskData.shortBreak || 5,
      longBreakLength: taskData.longBreak || 15,
      sessionsBeforeLong: totalCycles,
    }
  );

  // Track pause/resume
  pauseBtn.addEventListener("click", () => {
    isPaused = true;
  });
  startBtn.addEventListener("click", () => {
    isPaused = false;
  });

  // Reset cycles
  resetBtn.addEventListener("click", () => {
    workCompleted = 0;
    updateCycleCounter();
  });
}
// -- Motivational Quotes Rotator --

const quotes = [
    "You can do this!",
    "Stay focused, stay strong.",
    "Every minute counts.",
    "Progress, not perfection.",
    "One step at a time.",
    "Believe in yourself.",
    "Keep pushing forward.",
    "Your effort matters."
  ];
  
  let quoteIndex = 0;
  const quoteEl = document.getElementById("motivational-quote");
  
  function showNextQuote() {
    // Fade out
    quoteEl.classList.add("fade-out");
    setTimeout(() => {
      // Update text
      quoteIndex = (quoteIndex + 1) % quotes.length;
      quoteEl.textContent = quotes[quoteIndex];
      // Fade in
      quoteEl.classList.remove("fade-out");
    }, 500); // matches your CSS transition duration
  }
  
  // Start rotating every 15 seconds
  setInterval(showNextQuote, 15000);
  
  // Show first quote immediately
  quoteEl.textContent = quotes[0];
  