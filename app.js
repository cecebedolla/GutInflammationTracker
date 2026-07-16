const storageKey = "gutInflammationTracker.v2";
const themeKey = "gutInflammationTracker.theme";
const todayIso = new Date().toISOString().slice(0, 10);
const categories = ["Definitely keep", "Trial pause", "Maybe later", "Stop"];
const scoreNames = ["Bloating", "Burping", "Reflux", "Gas", "Energy", "Mood"];
const habits = ["7+ hours sleep", "8,000+ steps", "Strength training", "Omega-3", "Protein goal", "Hydration", "Low alcohol", "Stress management", "Walk after meal"];

const emptyData = {
  phase: "Phase 1 Calm Gut",
  today: { date: todayIso, notes: "", scores: Object.fromEntries(scoreNames.map((name) => [name, 0])) },
  treatments: [], symptoms: [], labs: [], foods: [], supplements: [],
  habits: Object.fromEntries(habits.map((habit) => [habit, false]))
};

let state = JSON.parse(localStorage.getItem(storageKey) || "null") || structuredClone(emptyData);
const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
const text = (value) => value || "—";
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(themeKey, theme);
  const button = document.getElementById("themeToggle");
  button.textContent = theme === "dark" ? "☀" : "☾";
  button.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
setTheme(localStorage.getItem(themeKey) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
document.getElementById("themeToggle").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

document.getElementById("todayDate").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
document.getElementById("phaseSelect").value = state.phase;
document.getElementById("dailyNotes").value = state.today.notes || "";

function empty(message) { return `<div class="empty-state">${message}</div>`; }
function detail(label, value) { return `<div class="detail"><span>${label}</span><strong>${escapeHtml(text(value))}</strong></div>`; }

function renderScores() {
  document.getElementById("scoreGrid").innerHTML = scoreNames.map((name) => `
    <label class="score-card">${name}
      <output id="${name}Out">${state.today.scores[name] ?? 0}</output>
      <input type="range" min="0" max="10" value="${state.today.scores[name] ?? 0}" data-score="${name}" />
    </label>`).join("");
}

function renderEntries() {
  const treatments = state.treatments.map((item) => `<article class="entry-card"><div class="entry-card-top"><div><h3>${escapeHtml(text(item.name))}</h3><p class="entry-meta">${escapeHtml(text(item.start))}${item.end ? ` → ${escapeHtml(item.end)}` : ""}</p></div><span class="badge">Treatment</span></div><div class="entry-details">${detail("Dose / instructions", item.dose)}${detail("Why", item.why)}${detail("Result / outcome", item.result)}</div></article>`).join("");
  document.getElementById("treatmentsList").innerHTML = treatments || empty("No treatments added yet.");

  const symptoms = state.symptoms.map((item) => `<article class="entry-card"><div class="entry-card-top"><div><h3>${escapeHtml(text(item.date))}</h3><p class="entry-meta">Daily symptom log</p></div><span class="badge">Symptoms</span></div><div class="entry-details">${detail("Morning belly", item.morning)}${detail("Evening belly", item.evening)}${detail("Bowel movement", item.bowel)}${detail("Trigger foods", item.triggers)}${detail("Notes", item.notes)}${detail("Photos", item.photos)}</div></article>`).join("");
  document.getElementById("symptomsList").innerHTML = symptoms || empty("No symptom logs yet.");

  const labs = state.labs.map((item, index) => `<article class="entry-card"><div class="entry-card-top"><div><h3>${escapeHtml(text(item.name))}</h3><p class="entry-meta">${item.completed ? `Completed ${escapeHtml(item.completed)}` : item.ordered ? `Ordered ${escapeHtml(item.ordered)}` : "Not dated"}</p></div><span class="badge">Test</span></div><div class="entry-details">${detail("Result", item.result)}${detail("Notes", item.notes)}</div><div class="check-row"><label><input type="checkbox" data-lab-done="${index}" ${item.done ? "checked" : ""}> Completed</label><label><input type="checkbox" data-lab-follow="${index}" ${item.followUp ? "checked" : ""}> Follow-up</label></div></article>`).join("");
  document.getElementById("labsList").innerHTML = labs || empty("No labs or tests added yet.");

  const foods = state.foods.map((item) => `<article class="entry-card"><div class="entry-card-top"><div><h3>${escapeHtml(text(item.food))}</h3><p class="entry-meta">${escapeHtml(text(item.reaction))}</p></div><span class="badge">${escapeHtml(text(item.status))}</span></div><div class="entry-details">${detail("Severity", item.severity ? `${item.severity}/10` : "")}${detail("Time to symptoms", item.time)}</div></article>`).join("");
  document.getElementById("foodsList").innerHTML = foods || empty("No food reactions added yet.");
}

function renderSupplements() {
  document.getElementById("supplementBoard").innerHTML = categories.map((category) => {
    const cards = state.supplements.filter((item) => item.decision === category).map((item) => `<article class="supplement-card"><strong>${escapeHtml(text(item.name))}</strong><p>${escapeHtml(text(item.dose))} · ${escapeHtml(text(item.purpose))}</p><p>Started ${escapeHtml(text(item.start))} · Helps? ${escapeHtml(text(item.helps))}</p><p>Side effects: ${escapeHtml(text(item.sideEffects))}</p></article>`).join("");
    return `<div class="supplement-column"><h3>${category}</h3>${cards || `<p class="entry-meta">Nothing here yet.</p>`}</div>`;
  }).join("");
}

function renderHabits() {
  const complete = habits.filter((habit) => state.habits[habit]).length;
  document.getElementById("habitCount").textContent = `${complete}/${habits.length} complete`;
  document.getElementById("habitGrid").innerHTML = habits.map((habit) => `<label class="habit-tile"><input type="checkbox" data-habit="${habit}" ${state.habits[habit] ? "checked" : ""}>${habit}</label>`).join("");
}

const fieldSets = {
  treatments: ["name", "start", "end", "dose", "why", "result"],
  symptoms: ["date", "morning", "evening", "bowel", "triggers", "notes", "photos"],
  labs: ["name", "ordered", "completed", "result", "notes"],
  foods: ["food", "reaction", "severity", "time", "status"],
  supplements: ["name", "dose", "purpose", "start", "helps", "sideEffects", "decision"]
};
const titles = { treatments:"treatment", symptoms:"symptom log", labs:"test", foods:"food reaction", supplements:"supplement" };

function openModal(type) {
  const modal = document.getElementById("entryModalTemplate").content.cloneNode(true).querySelector("dialog");
  modal.querySelector("#modalTitle").textContent = `Add ${titles[type]}`;
  modal.querySelector("#modalFields").innerHTML = fieldSets[type].map((field) => `<label>${field.replace(/([A-Z])/g, " $1")}<input name="${field}" ${["start","end","date","ordered","completed"].includes(field) ? 'type="date"' : ""} placeholder="${field === "decision" ? categories.join(" / ") : ""}"></label>`).join("");
  modal.querySelector("#modalSave").addEventListener("click", (event) => {
    event.preventDefault();
    const entry = Object.fromEntries(new FormData(modal.querySelector("form")).entries());
    if (type === "labs") { entry.done = false; entry.followUp = false; }
    state[type].push(entry); save(); renderAll(); modal.close();
  });
  document.body.append(modal);
  modal.addEventListener("close", () => modal.remove());
  modal.showModal();
}

function renderAll() { renderScores(); renderEntries(); renderSupplements(); renderHabits(); }
renderAll();

document.getElementById("phaseSelect").addEventListener("change", (event) => { state.phase = event.target.value; save(); });
document.getElementById("todayForm").addEventListener("input", (event) => {
  if (event.target.dataset.score) { state.today.scores[event.target.dataset.score] = event.target.value; document.getElementById(`${event.target.dataset.score}Out`).textContent = event.target.value; }
});
document.getElementById("todayForm").addEventListener("submit", (event) => {
  event.preventDefault(); state.today.date = todayIso; state.today.notes = document.getElementById("dailyNotes").value; save();
  document.getElementById("saveStatus").textContent = "Saved in this browser";
  setTimeout(() => document.getElementById("saveStatus").textContent = "", 2400);
});
document.addEventListener("change", (event) => {
  if (event.target.dataset.habit) { state.habits[event.target.dataset.habit] = event.target.checked; save(); renderHabits(); }
  if (event.target.dataset.labDone !== undefined) { state.labs[event.target.dataset.labDone].done = event.target.checked; save(); }
  if (event.target.dataset.labFollow !== undefined) { state.labs[event.target.dataset.labFollow].followUp = event.target.checked; save(); }
});
document.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => openModal(button.dataset.add)));
