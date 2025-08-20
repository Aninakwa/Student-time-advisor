import { auth, db } from "../firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { showLoading, hideLoading } from "./loading.js";

// Elements
const logoutBtn = document.getElementById("logout-btn");
const listEl = document.getElementById("task-history-list");
const statusEl = document.getElementById("filter-status");
const startEl = document.getElementById("filter-start");
const endEl = document.getElementById("filter-end");
const clearBtn = document.getElementById("filter-clear");

let allTasks = [];

// Wire logout
logoutBtn?.addEventListener("click", () =>
  signOut(auth).then(() => (location.href = "login.html"))
);

// Load and render
onAuthStateChanged(auth, async (user) => {
  if (!user) return location.replace("login.html");
  const uid = user.uid;

  showLoading();
  try {
    // Fetch all tasks once
    const snap = await getDocs(collection(db, "users", uid, "tasks"));
    allTasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Initial render
    applyFilters();
  } finally {
    hideLoading();
  }
});

// Apply current filters & render
function applyFilters() {
  let filtered = [...allTasks];

  // Status filter
  const status = statusEl.value;
  if (status === "completed") {
    filtered = filtered.filter((t) => t.completed);
  } else if (status === "pending") {
    filtered = filtered.filter((t) => !t.completed);
  }

  // Date filters (dueDate is string "YYYY-MM-DD")
  const start = startEl.value;
  const end = endEl.value;
  if (start) {
    filtered = filtered.filter((t) => t.dueDate && t.dueDate >= start);
  }
  if (end) {
    filtered = filtered.filter((t) => t.dueDate && t.dueDate <= end);
  }

  // Sort by dueDate descending, fallback to createdAt timestamp
  filtered.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return b.dueDate.localeCompare(a.dueDate);
    }
    // fallback: createdAt.seconds (if you stored Timestamp)
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });

  renderList(filtered);
}

// Render the list
function renderList(tasks) {
  listEl.innerHTML = "";
  if (tasks.length === 0) {
    listEl.innerHTML = `<li>No tasks found.</li>`;
    return;
  }

  tasks.forEach((t) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = t.title;

    const dates = document.createElement("div");
    dates.className = "task-dates";
    dates.textContent = `Due: ${t.dueDate || "—"} • Scheduled: ${
      t.scheduleTime || "—"
    }`;

    info.append(title, dates);

    const badge = document.createElement("span");
    badge.className = `badge ${t.completed ? "completed" : "pending"}`;
    badge.textContent = t.completed ? "Completed" : "Pending";

    li.append(info, badge);
    listEl.appendChild(li);
  });
}

// Filter event listeners
[statusEl, startEl, endEl].forEach((el) =>
  el.addEventListener("change", applyFilters)
);
clearBtn.addEventListener("click", () => {
  statusEl.value = "all";
  startEl.value = "";
  endEl.value = "";
  applyFilters();
});
