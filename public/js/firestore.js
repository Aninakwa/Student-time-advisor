// public/js/firestore.js

import { db } from "../firebaseConfig.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// — Tasks —

// Fetch all tasks
export async function loadTasks(uid) {
  const snap = await getDocs(collection(db, "users", uid, "tasks"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Create a new task
export function addTask(uid, task) {
  return addDoc(collection(db, "users", uid, "tasks"), {
    ...task,
    createdAt: Timestamp.now(),
  });
}

// Update existing task
export function updateTask(uid, taskId, updates) {
  return updateDoc(doc(db, "users", uid, "tasks", taskId), updates);
}

// Toggle task completion
export function toggleTask(uid, taskId, completed) {
  return updateDoc(doc(db, "users", uid, "tasks", taskId), { completed });
}

// Delete a task
export function deleteTask(uid, taskId) {
  return deleteDoc(doc(db, "users", uid, "tasks", taskId));
}

// Log a pomodoro session
export async function logPomodoro(uid, durationSec) {
  return addDoc(collection(db, "users", uid, "pomodoros"), {
    duration: durationSec,
    completedAt: new Date(),
  });
}

// Count today's sessions
export async function countTodaySessions(uid) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, "users", uid, "pomodoros"),
    where("completedAt", ">=", Timestamp.fromDate(startOfDay))
  );
  const snap = await getDocs(q);
  return snap.size;
}

// — Settings —

export async function loadSettings(uid) {
  const ref = doc(db, "users", uid, "meta", "settings");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return {
      workLength: 25,
      shortBreakLength: 5,
      longBreakLength: 15,
      notifySound: true,
      notifyBrowser: false,
    };
  }
  return snap.data();
}

export async function saveSettings(uid, settings) {
  const ref = doc(db, "users", uid, "meta", "settings");
  await setDoc(ref, settings, { merge: true });
}

/**
 * Fetch all active tasks with a scheduleTime (HH:mm) defined.
 */
export async function loadScheduledTasks(uid) {
  const snap = await getDocs(
    query(collection(db, "users", uid, "tasks"), where("active", "==", true))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter(
      (t) => typeof t.scheduleTime === "string" && t.scheduleTime.length === 5
    );
}

export async function loadSessionsLast7Days(uid) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);    // include today + 6 previous days
  start.setHours(0,0,0,0);

  const q = query(
    collection(db, "users", uid, "pomodoros"),
    where("completedAt", ">=", Timestamp.fromDate(start))
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
