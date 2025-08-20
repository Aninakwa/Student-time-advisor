import { auth } from "../firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { loadSettings, saveSettings } from "./firestore.js";
import { showLoading, hideLoading } from "./loading.js";

const logoutBtn = document.getElementById("logout-btn");
const workIn = document.getElementById("work-length");
const shortIn = document.getElementById("short-break-length");
const longIn = document.getElementById("long-break-length");
const soundIn = document.getElementById("notify-sound");
const browserIn = document.getElementById("notify-browser");
const saveBtn = document.getElementById("save-settings");

// Logout
logoutBtn?.addEventListener("click", () =>
  signOut(auth).then(() => location.replace("login.html"))
);

// When user is ready
onAuthStateChanged(auth, async (user) => {
  if (!user) return location.replace("login.html");
  const uid = user.uid;

  showLoading();
  try {
    const settings = await loadSettings(uid);
    workIn.value = settings.workLength;
    shortIn.value = settings.shortBreakLength;
    longIn.value = settings.longBreakLength;
    soundIn.checked = settings.notifySound;
    browserIn.checked = settings.notifyBrowser;
  } finally {
    hideLoading();
  }
});

// Save handler
saveBtn.addEventListener("click", async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const newSettings = {
    workLength: parseInt(workIn.value, 10),
    shortBreakLength: parseInt(shortIn.value, 10),
    longBreakLength: parseInt(longIn.value, 10),
    notifySound: soundIn.checked,
    notifyBrowser: browserIn.checked,
  };

  showLoading();
  try {
    await saveSettings(uid, newSettings);
    alert("Settings saved!");
  } catch (err) {
    console.error(err);
    alert("Failed to save settings.");
  } finally {
    hideLoading();
  }
});
