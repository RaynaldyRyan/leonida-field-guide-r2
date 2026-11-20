// Leonida Field Guide — tracker logic. Loads data/trophies.json (a file of this
// app, never the network), keeps progress in localStorage, and renders the
// dashboard, library, guide detail and roadmap views.
const STORE_KEY = "leonida-field-guide-v1";
const PHASES = [
  { n: 1, title: "Phase 1 — Story run", note: "Play Chapters 1–5 and the contact strands. Chapter and mission trophies unlock as you go. Watch for the one missable." },
  { n: 2, title: "Phase 2 — Activities, combat & collectibles", note: "Stunts, races, shooting range, drone races, heists, cards, WAiNK spots and vehicles. Most of the silver lives here." },
  { n: 3, title: "Phase 3 — Cleanup & platinum", note: "100% completion, challenges, money goals, exploration and the odd moments. The platinum pops when the last trophy does." },
];
const KIND_LABELS = { story: "Story", activity: "Activity", combat: "Combat", collectible: "Collectible", misc: "Misc" };
const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];

let trophies = [];
let earned = new Set();
let spoilerOn = true;

function loadStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    earned = new Set((raw.earned || []).filter((id) => Number.isInteger(id)));
    spoilerOn = raw.spoilerOn !== false;
  } catch {
    earned = new Set();
    spoilerOn = true;
  }
}

function saveStore() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), spoilerOn }));
}

function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

function isSpoilerHidden(t) {
  return spoilerOn && t.spoiler && !earned.has(t.id);
}

function nextUp() {
  // First unearned trophy in roadmap order that is not hidden by the spoiler
  // setting. Never names a spoiler-hidden trophy.
  const ordered = [...trophies].sort((a, b) => a.phase - b.phase || a.id - b.id);
  for (const t of ordered) {
    if (!earned.has(t.id) && !isSpoilerHidden(t)) return t;
  }
  return null;
}

function gradeBadge(t) {
  return `<span class="grade grade-${t.grade}">${t.grade}</span>`;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderProgress() {
  const count = earned.size;
  document.getElementById("earnedCount").textContent = String(count);
  document.getElementById("progressFill").style.width = (count / trophies.length * 100).toFixed(1) + "%";
  document.getElementById("progressNote").textContent =
    count === trophies.length
      ? "Platinum earned — Vice Got a Price! You are a Leonida Legend."
      : `Platinum: Vice Got a Price! — ${Math.round(count / trophies.length * 100)}% there`;
}

function renderStats() {
  const gradeList = document.getElementById("gradeStats");
  gradeList.innerHTML = GRADE_ORDER.map((g) => {
    const all = trophies.filter((t) => t.grade === g);
    const got = all.filter((t) => earned.has(t.id)).length;
    return `<li><span>${g}</span><strong>${got} / ${all.length}</strong></li>`;
  }).join("");
  const kindList = document.getElementById("kindStats");
  kindList.innerHTML = Object.keys(KIND_LABELS).map((k) => {
    const all = trophies.filter((t) => t.kind === k);
    const got = all.filter((t) => earned.has(t.id)).length;
    return `<li><span>${KIND_LABELS[k]}</span><strong>${got} / ${all.length}</strong></li>`;
  }).join("");
  const phaseList = document.getElementById("phaseSummary");
  phaseList.innerHTML = PHASES.map((p) => {
    const all = trophies.filter((t) => t.phase === p.n);
    const got = all.filter((t) => earned.has(t.id)).length;
    return `<li><strong>${esc(p.title)}</strong> — ${got} / ${all.length} earned</li>`;
  }).join("");
}

function renderNextUp() {
  const body = document.getElementById("nextUpBody");
  const t = nextUp();
  if (!t) {
    body.innerHTML = `<p><strong>All 55 earned.</strong> Vice Got a Price! is yours — Leonida Legend.</p>`;
    return;
  }
  body.innerHTML = `
    <p class="next-name">#${t.id} ${gradeBadge(t)} <strong>${esc(t.name)}</strong></p>
    <p>${esc(t.description)}</p>
    <p class="muted">${esc(t.guide.split(".")[0])}.</p>
    <p><button type="button" class="primary-btn" data-open-guide="${t.id}">Open guide</button>
    <span class="muted small"> ${KIND_LABELS[t.kind]} · Phase ${t.phase}${t.missable ? " · MISSABLE" : ""}</span></p>`;
}

function filteredTrophies() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const grade = document.getElementById("gradeFilter").value;
  const kind = document.getElementById("kindFilter").value;
  const earnedSel = document.getElementById("earnedFilter").value;
  return trophies.filter((t) => {
    if (grade && t.grade !== grade) return false;
    if (kind && t.kind !== kind) return false;
    if (earnedSel === "earned" && !earned.has(t.id)) return false;
    if (earnedSel === "unearned" && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderLibrary() {
  const list = document.getElementById("trophyList");
  const rows = filteredTrophies();
  document.getElementById("resultCount").textContent =
    `${rows.length} of ${trophies.length} trophies shown · ${earned.size} earned`;
  list.innerHTML = rows.map((t) => {
    const hidden = isSpoilerHidden(t);
    const name = hidden ? "Hidden story trophy" : esc(t.name);
    const desc = hidden ? "Spoiler hidden until earned — turn the spoiler setting off to reveal it." : esc(t.description);
    return `<li class="trophy-row${earned.has(t.id) ? " is-earned" : ""}" data-id="${t.id}">
      <label class="check"><input type="checkbox" data-earn="${t.id}"${earned.has(t.id) ? " checked" : ""} aria-label="Mark ${esc(t.name)} earned"> <span class="check-box" aria-hidden="true">${earned.has(t.id) ? "✓" : ""}</span></label>
      <button type="button" class="row-main" data-open-guide="${t.id}">
        <span class="row-title">${gradeBadge(t)} <strong>${name}</strong>${t.missable ? ' <span class="missable-badge">MISSABLE</span>' : ""}</span>
        <span class="row-desc">${desc}</span>
        <span class="row-meta">${KIND_LABELS[t.kind]} · Phase ${t.phase}</span>
      </button>
    </li>`;
  }).join("");
}

function renderGuideDetail(t) {
  const panel = document.getElementById("guideDetail");
  const body = document.getElementById("guideDetailBody");
  const sources = (t.sources || []).map((s) =>
    `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join("");
  body.innerHTML = `
    <p class="next-name">#${t.id} ${gradeBadge(t)} <strong>${esc(t.name)}</strong>${t.missable ? ' <span class="missable-badge">MISSABLE</span>' : ""}</p>
    <p class="official">Official: ${esc(t.description)}</p>
    <p>${esc(t.guide)}</p>
    <p class="muted small">${KIND_LABELS[t.kind]} · Phase ${t.phase} · ${earned.has(t.id) ? "Earned" : "Not yet earned"}</p>
    <h3>Sources</h3>
    <ul class="source-list">${sources}</ul>
    <p class="muted small">Guides are in our own words. A source is cited, never copied.</p>`;
  panel.hidden = false;
  panel.scrollIntoView({ block: "nearest" });
}

function renderRoadmap() {
  const wrap = document.getElementById("roadmapPhases");
  wrap.innerHTML = PHASES.map((p) => {
    const items = trophies.filter((t) => t.phase === p.n);
    const got = items.filter((t) => earned.has(t.id)).length;
    const rows = items.map((t) => {
      const hidden = isSpoilerHidden(t);
      return `<li class="${earned.has(t.id) ? "is-earned" : ""}"><button type="button" data-open-guide="${t.id}">#${t.id} ${hidden ? "Hidden story trophy" : esc(t.name)}</button>${t.missable ? ' <span class="missable-badge">MISSABLE</span>' : ""}${earned.has(t.id) ? " ✓" : ""}</li>`;
    }).join("");
    return `<article class="card phase"><h2>${esc(p.title)} — ${got} / ${items.length}</h2><p class="muted">${esc(p.note)}</p><ul class="phase-trophies">${rows}</ul></article>`;
  }).join("");
}

function renderAll() {
  renderProgress();
  renderStats();
  renderNextUp();
  renderLibrary();
  renderRoadmap();
}

function showView(name) {
  document.querySelectorAll("#viewTabs .tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === name));
  document.getElementById("view-dashboard").hidden = name !== "dashboard";
  document.getElementById("view-library").hidden = name !== "library";
  document.getElementById("view-roadmap").hidden = name !== "roadmap";
  if (name === "library") renderLibrary();
  if (name === "roadmap") renderRoadmap();
}

function applyQuery() {
  const params = new URLSearchParams(location.search);
  const view = params.get("view");
  if (view === "library" || view === "roadmap" || view === "dashboard") showView(view);
  const kind = params.get("kind");
  if (kind && KIND_LABELS[kind]) document.getElementById("kindFilter").value = kind;
  const earnedSel = params.get("earned");
  if (earnedSel === "earned" || earnedSel === "unearned") document.getElementById("earnedFilter").value = earnedSel;
  const trophyId = Number(params.get("trophy"));
  if (Number.isInteger(trophyId) && trophyById(trophyId)) {
    showView("library");
    renderGuideDetail(trophyById(trophyId));
  }
  // Re-render after applying the query filters: setting a select's value does
  // not re-run the filter, so the list would otherwise ignore ?kind= / ?earned=.
  renderLibrary();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...earned].sort((a, b) => a - b), spoilerOn, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-field-guide-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const ids = (data.earned || []).filter((id) => Number.isInteger(id) && trophyById(id));
      earned = new Set(ids);
      if (typeof data.spoilerOn === "boolean") spoilerOn = data.spoilerOn;
      document.getElementById("spoilerToggle").checked = spoilerOn;
      saveStore();
      renderAll();
    } catch {
      alert("That file is not a valid Leonida Field Guide export.");
    }
  };
  reader.readAsText(file);
}

async function init() {
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  trophies = Array.isArray(data) ? data : data.trophies;
  loadStore();
  document.getElementById("spoilerToggle").checked = spoilerOn;
  document.getElementById("searchInput").addEventListener("input", renderLibrary);
  document.getElementById("gradeFilter").addEventListener("change", renderLibrary);
  document.getElementById("kindFilter").addEventListener("change", renderLibrary);
  document.getElementById("earnedFilter").addEventListener("change", renderLibrary);
  document.getElementById("spoilerToggle").addEventListener("change", (e) => {
    spoilerOn = e.target.checked;
    saveStore();
    renderAll();
  });
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", (e) => {
    if (e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  document.getElementById("detailClose").addEventListener("click", () => {
    document.getElementById("guideDetail").hidden = true;
  });
  document.querySelectorAll("#viewTabs .tab").forEach((b) =>
    b.addEventListener("click", () => showView(b.dataset.view)));
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-guide]");
    if (opener) {
      const t = trophyById(Number(opener.dataset.openGuide));
      if (t) {
        showView("library");
        renderGuideDetail(t);
      }
      return;
    }
    const checker = e.target.closest("[data-earn]");
    if (checker) {
      const id = Number(checker.dataset.earn);
      if (checker.checked) earned.add(id); else earned.delete(id);
      saveStore();
      renderAll();
    }
  });
  renderAll();
  applyQuery();
}

init();
