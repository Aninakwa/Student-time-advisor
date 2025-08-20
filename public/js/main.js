// public/js/main.js

// ── Imports ────────────────────────────────────────────────────────────────────
import {
  initAuthListeners,
  signUp,
  logIn,
  socialLogin,
  logOut,
} from "./auth.js";
import {
  loadTasks,
  countTodaySessions,
  deleteTask,
} from "./firestore.js";

import {
  renderGroupedTasks,
  renderSuggestions,
} from "./ui.js";
import { format, isToday, parseISO } from "https://cdn.skypack.dev/date-fns";

import { showLoading, hideLoading } from "./loading.js";

import { getSuggestions } from "./suggestions.js";

// ── Helpers ────────────────────────────────────────────────────────────────────
function onAuthPages() {
  return /login\.html$|signup\.html$/i.test(location.pathname);
}

function onDashboard() {
  return /dashboard\.html$/i.test(location.pathname);
}


// ── Bootstrapping ───────────────────────────────────────────────────────────────
initAuthListeners({
  onSignedIn: (user) => {
    if (onAuthPages()) {
      window.location.href = "../pages/dashboard.html";
    } else if (onDashboard()) {
      startApp(user.uid);
    }
  },
  onSignedOut: () => {
    if (onDashboard()) {
      window.location.href = "../pages/login.html";
    }
  },
});

// ── Auth Forms & Social Buttons ─────────────────────────────────────────────────
document
  .getElementById("signup-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading();
    try {
      await signUp(
        document.getElementById("signup-name").value.trim(),
        document.getElementById("signup-email").value.trim(),
        document.getElementById("signup-password").value
      );
    } catch (err) {
      alert(`Sign‑up failed: ${err.message}`);
    }
    hideLoading();
    // If sign-up successful, redirect to dashboard
    if (onAuthPages()) {
      window.location.href = "../pages/dashboard.html";
    }
  });

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoading();
  try {
    await logIn(
      document.getElementById("login-email").value.trim(),
      document.getElementById("login-password").value
    );
  } catch (err) {
    alert(`Log‑in failed: ${err.message}`);
  }
  hideLoading();
  // If login successful, redirect to dashboard
  if (onAuthPages()) {
    window.location.href = "dashboard.html";
  }
});

["google", "facebook"].forEach((provider) => {
  document
    .getElementById(`${provider}-login`)
    ?.addEventListener("click", () => socialLogin(provider));
  document
    .getElementById(`${provider}-signup`)
    ?.addEventListener("click", () => socialLogin(provider));
});

document
  .getElementById("logout-btn")
  ?.addEventListener("click", () => logOut());

// ── Main App Init (Dashboard only) ──────────────────────────────────────────────
function startApp(uid) {
  // Callbacks
  async function handleEdit(id) {
    window.location.href = `task.html?id=${id}`;
  }

  async function handleDelete(id) {
    if (!confirm("Delete this task?")) return;
    showLoading();

    await deleteTask(uid, id);

    refreshOverview();
    refreshSuggestions();
    hideLoading();
    alert("Task deleted successfully!");
  }

  function handleStart(id) {
    // Navigate to Task Page in “run” mode
    window.location.href = `do-task.html?start=1&id=${id}`;
  }
  async function refreshOverview() {
    showLoading();
    try {
      const tasks = await loadTasks(uid);

      // 1) Filter: only incomplete OR due today
      const todayTasks = tasks.filter(
        (t) => !t.completed || (t.dueDate && isToday(parseISO(t.dueDate)))
      );

      // 2) Group by dueDate (formatted) or “No Date”
      const groups = {};
      todayTasks.forEach((t) => {
        const key = t.dueDate
          ? format(parseISO(t.dueDate), "yyyy-MM-dd")
          : "No Date";
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
      });

      // 3) Sort groups: today first, then by date ascending, then No Date last
      const todayKey = format(new Date(), "yyyy-MM-dd");
      const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === todayKey) return -1;
        if (b === todayKey) return 1;
        if (a === "No Date") return 1;
        if (b === "No Date") return -1;
        return a.localeCompare(b);
      });

      renderGroupedTasks(
        groups,
        sortedKeys,
        handleEdit,
        handleDelete,
        handleStart
      );
    } finally {
      hideLoading();
    }
  }

  refreshOverview();
  refreshSuggestions();

  // 2) Suggestions
  async function refreshSuggestions() {
    const tasks = await loadTasks(uid);
    const incomplete = tasks.filter((t) => !t.completed).length;
    const sessions = await countTodaySessions(uid);
    renderSuggestions(getSuggestions(incomplete, sessions));
  }
  refreshSuggestions();

  // 3) “Add Task” → Task Page in new mode
  document.getElementById("add-task-btn")?.addEventListener("click", () => {
    window.location.href = "task.html?new=1";
  });

}
