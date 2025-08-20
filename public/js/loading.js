// public/js/loading.js

const overlay = document.getElementById("loading-overlay");

export function showLoading() {
  overlay?.classList.remove("hidden");
}

export function hideLoading() {
  overlay?.classList.add("hidden");
}
