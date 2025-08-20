// public/js/task-main.js

import { auth, db } from "../firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { addTask, updateTask } from "./firestore.js";
import { showLoading, hideLoading } from "./loading.js";

// Read taskId (if any) from URL
const params = new URLSearchParams(window.location.search);
const taskId = params.get("id");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    return window.location.replace("login.html");
  }
  const uid = user.uid;

  // Elements
  const pageTitle = document.getElementById("page-title");
  const form = document.getElementById("task-form");
  const titleIn = document.getElementById("task-title-input");
  const detailsIn = document.getElementById("task-details-input");
  const dueIn = document.getElementById("task-due-input");
  const workIn = document.getElementById("task-work-input");
  const breakIn = document.getElementById("task-break-input");
  const cyclesIn = document.getElementById("task-cycles-input");
  const timeIn = document.getElementById("task-time-input");
  const activeIn = document.getElementById("task-active-input");
  const cancelBtn = document.getElementById("task-cancel-btn");
  const timerSection = document.getElementById("timer-section");

  // Logout
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "../pages/login.html";
  });

  // If editing an existing task, load its data
  showLoading();
  let isEditing = false;
  let taskData = {};

  if (taskId) {
    const snap = await getDoc(doc(db, "users", uid, "tasks", taskId));
    if (snap.exists()) {
      isEditing = true;
      taskData = snap.data();
      pageTitle.textContent = "Edit Task";
      // Populate form
      titleIn.value = taskData.title;
      detailsIn.value = taskData.details || "";
      dueIn.value = taskData.dueDate || "";
      workIn.value = taskData.workDuration || 25;
      breakIn.value = taskData.shortBreak || 5;
      cyclesIn.value = taskData.cycles || 1;
      timeIn.value = taskData.scheduleTime || "";
      activeIn.checked = taskData.active;
    } else {
      alert("Task not found.");
      return window.location.replace("dashboard.html");
    }
    hideLoading();
  } else {
    pageTitle.textContent = "New Task";
    hideLoading();
  }

  // Cancel button: go back
  cancelBtn.addEventListener("click", () => window.history.back());

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    showLoading();
    e.preventDefault();
    const data = {
      title: titleIn.value.trim(),
      details: detailsIn.value.trim(),
      dueDate: dueIn.value,
      workDuration: parseInt(workIn.value, 10),
      shortBreak: parseInt(breakIn.value, 10),
      cycles: parseInt(cyclesIn.value, 10),
      scheduleTime: timeIn.value,
      active: activeIn.checked,
    };

    if (isEditing) {
      await updateTask(uid, taskId, data);
      // redirect to the dashboard
      window.location.replace("dashboard.html");
    } else {
      const newDoc = await addTask(uid, data);
      // switch to edit mode on the newly created task
      window.location.replace("dashboard.html");
      return;
    }
    hideLoading();
    // Show success message
    alert("Task saved successfully!");
    window.location.replace("dashboard.html");});
});
