// public/js/ui.js
import { formatTime, getRemaining } from "./timer.js";


/**
 * Populate the settings form with current values
 */
export function populateSettingsForm(settings) {
    document.getElementById("work-length").value       = settings.workLength;
    document.getElementById("short-break-length").value = settings.shortBreakLength;
    document.getElementById("long-break-length").value   = settings.longBreakLength;
    document.getElementById("notify-sound").checked      = settings.notifySound;
    document.getElementById("notify-browser").checked    = settings.notifyBrowser;
  }
  
/**
 * Render grouped tasks with date headings.
 *
 * @param {Object} groups      — map of date string → array of tasks
 * @param {string[]} keys      — ordered list of group keys
 * @param onEdit, onDelete, onStart — callbacks
 */
export function renderGroupedTasks(groups, keys, onEdit, onDelete, onStart) {
  const ul = document.getElementById("task-list");
  if (!ul) return;
  ul.innerHTML = "";

  keys.forEach(key => {
    // Heading
    const header = document.createElement("li");
    header.className = "group-header";
    header.textContent = key === "No Date"
      ? "No Due Date"
      : key === (new Date()).toISOString().slice(0,10)
        ? "Today"
        : new Date(key).toLocaleDateString();
    ul.appendChild(header);

    // Tasks under this date
    groups[key].forEach(t => {
      const li = document.createElement("li");
      li.dataset.id = t.id;

      // Info
      const info = document.createElement("div");
      info.className = "task-info";
      const title = document.createElement("span");
      title.textContent = t.title;
      if (t.completed) title.classList.add("completed");
      info.append(title);

      // Buttons
      const btns = document.createElement("div");
      btns.className = "task-btns";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.disabled = t.completed;
      editBtn.addEventListener("click", () => onEdit(t.id));

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => onDelete(t.id));

      const startBtn = document.createElement("button");
      startBtn.textContent = "Start";
      startBtn.disabled = t.completed;
      startBtn.addEventListener("click", () => onStart(t.id));

      btns.append(editBtn, delBtn, startBtn);

      li.append(info, btns);
      ul.appendChild(li);
    });
  });
}


/**
 * Render an array of suggestion strings into #suggestion-list
 */
export function renderSuggestions(suggestions) {
    const ul = document.getElementById("suggestion-list");
    if (!ul) return;
    ul.innerHTML = "";
    suggestions.forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    });
  }

  /**
   * Read values from the settings form into an object
   */
  export function readSettingsForm() {
    return {
      workLength:        parseInt(document.getElementById("work-length").value,       10),
      shortBreakLength:  parseInt(document.getElementById("short-break-length").value,10),
      longBreakLength:   parseInt(document.getElementById("long-break-length").value, 10),
      notifySound:       document.getElementById("notify-sound").checked,
      notifyBrowser:     document.getElementById("notify-browser").checked
    };
}
