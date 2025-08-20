import { auth, storage } from "../firebaseConfig.js";
import {
  onAuthStateChanged,
  updateProfile,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { showLoading, hideLoading } from "./loading.js";

const logoutBtn = document.getElementById("logout-btn");
const form = document.getElementById("profile-form");
const nameIn = document.getElementById("display-name");
const emailIn = document.getElementById("email");
const photoPreview = document.getElementById("photo-preview");
const changeBtn = document.getElementById("change-photo-btn");
const fileInput = document.getElementById("photo-file-input");

let newPhotoURL = null; // to hold the uploaded photo's URL

// Logout
logoutBtn?.addEventListener("click", () =>
  signOut(auth).then(() => location.replace("login.html"))
);

// Show file picker when pencil clicked
changeBtn.addEventListener("click", () => fileInput.click());

// Handle file selection & upload
fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;
  showLoading();
  try {
    const user = auth.currentUser;
    const fileRef = storageRef(storage, `userPhotos/${user.uid}`);
    await uploadBytes(fileRef, file);
    newPhotoURL = await getDownloadURL(fileRef);
    photoPreview.src = newPhotoURL;
  } catch (err) {
    console.error(err);
    alert("Failed to upload photo.");
  } finally {
    hideLoading();
  }
});

// Populate form on load
onAuthStateChanged(auth, (user) => {
  if (!user) return location.replace("login.html");
  nameIn.value = user.displayName || "";
  emailIn.value = user.email || "";
  photoPreview.src = user.photoURL || "/assets/default-avatar.png";
});

// Save handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  showLoading();
  try {
    await updateProfile(user, {
      displayName: nameIn.value.trim(),
      photoURL: newPhotoURL || user.photoURL || null,
    });
    alert("Profile updated!");
  } catch (err) {
    console.error(err);
    alert("Failed to update profile: " + err.message);
  } finally {
    hideLoading();
  }
});
