// public/js/history-main.js

import { auth } from "../firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  fetchSessions,
  countTotalSessions,
  countTodaySessions,
} from "./history.js";

import { showLoading, hideLoading } from "./loading.js";

import { renderSessionList } from "./ui.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // not signed in → back to login
    window.location.href = "../pages/login.html";
    return;
  }
  // User is signed in → load history
  const uid = user.uid;

  // 1) Fetch & render the list
  const sessions = await fetchSessions(uid, 50);
  renderSessionList(sessions);

  // 2) Fetch & display stats
  const total = await countTotalSessions(uid);
  const today = await countTodaySessions(uid);
  document.getElementById(
    "total-sessions"
  ).textContent = `Total sessions: ${total}`;
  document.getElementById("today-sessions").textContent = `Today: ${today}`;

  // 3) Wire logout
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "../pages/login.html";
  });
});
