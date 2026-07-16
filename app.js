const storageKey = "gutInflammationTracker.v1";
const todayIso = new Date().toISOString().slice(0, 10);
const categories = ["Definitely keep", "Trial pause", "Maybe later", "Stop"];
const scoreNames = ["Bloating", "Burping", "Reflux", "Gas", "Energy", "Mood"];
const habits = ["7+ hours sleep", "8,000+ steps", "Strength training", "Omega-3", "Protein goal", "Hydration", "Low alcohol", "Stress management", "Walk after meal"];

const sampleData = {
  phase: "Phase 1 Calm Gut",
  today: { date: todayIso, notes: "Sample: less bloating after a slow walk after lunch.", scores: { Bloating: 4, Burping: 3, Reflux: 2, Gas: 5, Energy: 7, Mood: 7 } },
  treatments: [
    { name: "Fixan / rifaximin", start: "2026-06-24", end: "2026-07-08", dose: "As prescribed with meals", why: "SIBO/IBS treatment phase", result: "In progress; watching bloating and gas" },
    { name: "Mentsii / peppermint oil", start: "2026-06-20", end: "", dose: "Before meals as tolerated", why: "Calm cramping and motility discomfort", result: "Helpful on high-gas days" },
    { name: "Probiotics", start: "2026-07-10", end: "", dose: "Low dose trial", why: "Rebuild phase support", result: "Planned" },
    { name: "D-mannose", start: "2026-06-12", end: "", dose: "Daily", why: "Urinary tract support", result: "No side effects noted" },
    { name: "Omega-3", start: "2026-06-01", end: "", dose: "With breakfast", why: "Inflammation support", result: "Keep" },
    { name: "Magnesium", start: "2026-06-01", end: "", dose: "Evening", why: "Sleep, stress, bowel regularity", result: "Helps sleep" }
  ],
  symptoms: [
    { date: todayIso, morning: "mild", evening: "bloated", bowel: "mixed", triggers: "Coffee, bread", notes: "Energy better than yesterday", photos: "Morning photo placeholder · Evening photo placeholder" }
  ],
  labs: ["SIBO breath test", "H. pylori test", "Celiac blood test", "CBC", "CMP", "Vitamin D", "B12", "Ferritin/iron", "hs-CRP", "Lipid panel"].map((name) => ({ name, ordered: "", completed: "", result: "", notes: "", done: false, followUp: false })),
  foods: ["Eggs", "Coffee", "Wine", "Bread", "Fruit", "Protein powder", "Spicy foods"].map((food, index) => ({ food, reaction: index % 2 ? "Gas / reflux" : "Bloating", severity: [3, 6, 7, 8, 4, 5, 6][index], time: "1–3 hours", status: index > 1 ? "avoid" : "questionable" })),
  supplements: [
    { name: "Omega-3", dose: "Daily", purpose: "Inflammation support", start: "2026-06-01", helps: "yes", sideEffects: "None", decision: "Definitely keep" },
    { name: "Magnesium", dose: "Evening", purpose: "Sleep and regularity", start: "2026-06-01", helps: "yes", sideEffects: "Loose stool if too much", decision: "Definitely keep" },
    { name: "Protein powder", dose: "1 scoop", purpose: "Protein goal", start: "2026-06-15", helps: "unsure", sideEffects: "Possible bloating", decision: "Trial pause" }
  ],
  habits: Object.fromEntries(habits.map((habit, index) => [habit, index < 4]))
};

let state = JSON.parse(localStorage.getItem(storageKey) || "null") || sampleData;
const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
const text = (value) => value || "—";

document.getElementById("todayDate").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
document.getElementById("phaseSelect").value = state.phase;
document.getElementById("dailyNotes").value = state.today.notes || "";

function renderScores() {
  const grid = document.getElementById("scoreGrid");
  grid.innerHTML = scoreNames.map((name) => `
    <label class="score-card">${name}
      <output id="${name}Out">${state.today.scores[name] ?? 0}</output>
      <input type="range" min="0" max="10" value="${state.today.scores[name] ?? 0}" data-score="${name}" />
    </label>`).join("");
}

function renderRows() {
  document.getElementById("treatmentsRows").innerHTML = state.treatments.map((item) => `<tr><td><strong>${text(item.name)}</strong></td><td>${text(item.start)}<br>${text(item.end)}</td><td>${text(item.dose)}</td><td>${text(item.why)}</td><td>${text(item.result)}</td></tr>`).join("");
  document.getElementById("symptomsRows").innerHTML = state.symptoms.map((item) => `<tr><td><strong>${text(item.date)}</strong></td><td>${text(item.morning)}</td><td>${text(item.evening)}</td><td>${text(item.bowel)}</td><td>${text(item.triggers)}</td><td>${text(item.notes)}</td><td>${text(item.photos)}</td></tr>`).join("");
  document.getElementById("labsRows").innerHTML = state.labs.map((item, index) => `<tr><td class="checkbox-cell"><input type="checkbox" data-lab-done="${index}" ${item.done ? "checked" : ""}></td><td><strong>${text(item.name)}</strong></td><td>${text(item.ordered)}</td><td>${text(item.completed)}</td><td>${text(item.result)}</td><td>${text(item.notes)}</td><td><input type="checkbox" data-lab-follow="${index}" ${item.followUp ? "checked" : ""}></td></tr>`).join("");
  document.getElementById("foodsRows").innerHTML = state.foods.map((item) => `<tr><td><strong>${text(item.food)}</strong></td><td>${text(item.reaction)}</td><td>${text(item.severity)}/10</td><td>${text(item.time)}</td><td><span class="badge">${text(item.status)}</span></td></tr>`).join("");
}

function renderSupplements() {
  document.getElementById("supplementBoard").innerHTML = categories.map((category) => `<div class="supplement-column"><h3>${category}</h3>${state.supplements.filter((item) => item.decision === category).map((item) => `<article class="supplement-card"><strong>${item.name}</strong><p>${item.dose} · ${item.purpose}</p><p>Started ${text(item.start)} · Helps? ${item.helps}</p><p>Side effects: ${text(item.sideEffects)}</p></article>`).join("")}</div>`).join("");
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

function openModal(type) {
  const modal = document.getElementById("entryModalTemplate").content.cloneNode(true).querySelector("dialog");
  modal.querySelector("#modalTitle").textContent = `Add ${type.slice(0, -1)}`;
  modal.querySelector("#modalFields").innerHTML = fieldSets[type].map((field) => `<label>${field.replace(/([A-Z])/g, " $1")}<input name="${field}" placeholder="${field === "decision" ? categories.join(' / ') : ''}"></label>`).join("");
  modal.querySelector("#modalSave").addEventListener("click", (event) => {
    event.preventDefault();
    const entry = Object.fromEntries(new FormData(modal.querySelector("form")).entries());
    if (type === "labs") entry.followUp = false;
    state[type].push(entry);
    save();
    renderAll();
    modal.close();
  });
  document.body.append(modal);
  modal.addEventListener("close", () => modal.remove());
  modal.showModal();
}

function renderAll() { renderScores(); renderRows(); renderSupplements(); renderHabits(); }
renderAll();

document.getElementById("phaseSelect").addEventListener("change", (event) => { state.phase = event.target.value; save(); });
document.getElementById("todayForm").addEventListener("input", (event) => {
  if (event.target.dataset.score) {
    state.today.scores[event.target.dataset.score] = event.target.value;
    document.getElementById(`${event.target.dataset.score}Out`).textContent = event.target.value;
  }
});
document.getElementById("todayForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.today.date = todayIso;
  state.today.notes = document.getElementById("dailyNotes").value;
  save();
  document.getElementById("saveStatus").textContent = "Saved in this browser";
  setTimeout(() => document.getElementById("saveStatus").textContent = "", 2400);
});
document.addEventListener("change", (event) => {
  if (event.target.dataset.habit) { state.habits[event.target.dataset.habit] = event.target.checked; save(); renderHabits(); }
  if (event.target.dataset.labDone) { state.labs[event.target.dataset.labDone].done = event.target.checked; save(); }
  if (event.target.dataset.labFollow) { state.labs[event.target.dataset.labFollow].followUp = event.target.checked; save(); }
});
document.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => openModal(button.dataset.add)));