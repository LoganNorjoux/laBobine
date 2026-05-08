const state = {
  periodes: []
};

let draggedFilmId = null;

// =======================
// UTIL
// =======================
function createId() {
  return crypto.randomUUID();
}

// =======================
// PERIODES
// =======================
function addPeriode() {
  state.periodes.push({
    id: createId(),
    debut: "",
    fin: "",
    films: [],
    ui: { open: true }
  });

  render();
}

function removePeriode(id) {
  state.periodes = state.periodes.filter(p => p.id !== id);
  render();
  renderPDFPreview();
}

// =======================
// FILMS
// =======================
function addFilm(periodeId) {
  const p = state.periodes.find(p => p.id === periodeId);
  if (!p) return;

  if (!p.debut || !p.fin) return; // sécurité

  p.films.push({
    id: createId(),
    titre: "",
    age: "",
    horaires: {},
    ui: { open: true }
  });

  render();
}

function removeFilm(periodeId, filmId) {
  const p = state.periodes.find(p => p.id === periodeId);
  if (!p) return;

  p.films = p.films.filter(f => f.id !== filmId);
  render();
}

// =======================
// TITRES LIVE
// =======================
function updatePeriodeTitle(periode) {
  const el = document.querySelector(`[data-title-id="${periode.id}"]`);
  if (!el) return;

  el.textContent =
    periode.debut && periode.fin
      ? `Période (${periode.debut} → ${periode.fin})`
      : "Période";
}

function updateFilmTitle(film) {
  const el = document.querySelector(`[data-film-title-id="${film.id}"]`);
  if (!el) return;

  const titre = film.titre || "Film";
  const age = film.age ? ` (${film.age})` : "";

  el.textContent = titre + age;
}

// =======================
// INPUT GLOBAL
// =======================
document.addEventListener("input", (e) => {
  const el = e.target;

  const periodeId = el.dataset.periodeId;
  const filmId = el.dataset.filmId;
  const field = el.dataset.field;

  if (!field) return;

  const periode = state.periodes.find(p => p.id === periodeId);
  if (!periode) return;

  // =======================
  // PERIODE
  // =======================
  if (!filmId) {

    if (field === "debut") {
      periode.debut = el.value;
    }

    if (field === "fin") {
      periode.fin = el.value;
    }

    updatePeriodeTitle(periode);
    updateAddFilmState(periode);

    // important :
    // rerender pour recalculer les dates horaires
    render();

    return;
  }

  // =======================
  // FILM
  // =======================
  const film = periode.films.find(f => f.id === filmId);
  if (!film) return;

  if (field === "titre") {
    film.titre = el.value;
  }

  if (field === "age") {
    film.age = el.value;
  }

  if (field === "titre" || field === "age") {
    updateFilmTitle(film);
  }

  if (field === "horaire") {

    const date = el.dataset.date;

    film.horaires[date] = el.value
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  }

  // preview live uniforme
  renderPDFPreview();
});

// =======================
// DATES
// =======================
function getDates(debut, fin) {
  if (!debut || !fin) return [];

  const dates = [];
  let current = new Date(debut);
  const end = new Date(fin);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// =======================
// RENDER
// =======================
const container = document.getElementById("periodes");

function render() {
  container.innerHTML = "";

  state.periodes.forEach(p => {
    const dates = getDates(p.debut, p.fin);

    const div = document.createElement("div");
    div.className = "periode";

    div.innerHTML = `
  <div class="periode-header" onclick="togglePeriode('${p.id}')">
    
    <h3 data-title-id="${p.id}">
      ${p.debut && p.fin ? `Période (${p.debut} → ${p.fin})` : "Période"}
    </h3>

    <div style="display:flex; gap:6px; align-items:center;">

      <button type="button"
  class="edit-btn"
  style="cursor: pointer"
  onclick="event.stopPropagation(); openPeriodeModal('${p.id}')">
  ✏️
</button>

<button type="button"
  class="delete-btn"
  style="cursor: pointer"
  onclick="event.stopPropagation(); removePeriode('${p.id}')">
  🗑️
</button>

    </div>

  </div>

  <div class="periode-body ${p.ui.open ? "" : "collapsed"}">

    <!-- RÉCAP FILMS -->
    <div class="films">

      ${p.films.map(f => `
        <div class="film"
  data-film-id="${f.id}"
  draggable="true"

  ondragstart="handleDragStart(event, '${p.id}', '${f.id}')"

  ondragend="handleDragEnd()"

  ondragover="handleDragOver(event)"

  ondrop="handleDrop(event, '${p.id}', '${f.id}')">

  <div class="film-header"
    onclick="toggleFilm('${p.id}','${f.id}')">

    <h3 data-film-title-id="${f.id}">
      ${f.titre || "Film"}${f.age ? ` (${f.age})` : ""}
    </h3>

    <div style="display:flex; gap:6px; align-items:center;">

      <button type="button"
        class="edit-btn"
		style="cursor: pointer"
        onclick="event.stopPropagation(); openFilmModal('${p.id}','${f.id}')">
        ✏️
      </button>

      <button type="button"
        class="delete-btn"
style="cursor: pointer"
        onclick="event.stopPropagation(); removeFilm('${p.id}','${f.id}')">
        🗑️
      </button>

    </div>

  </div>
</div>
      `).join("")}

    </div>

    <!-- ACTION AJOUT FILM -->
    <button type="button"
      class="primary"
      onclick="openFilmModal('${p.id}')"
      ${!p.debut || !p.fin ? "disabled title='Saisis les dates dans la modale période'" : ""}>
      + Film
    </button>

  </div>
`;

    container.appendChild(div);
  });

  // update états bouton après render
  state.periodes.forEach(updateAddFilmState);
  
  renderPDFPreview();
}

// =======================
// bouton addFilm propre
// =======================
function updateAddFilmState(periode) {
  const btn = document.querySelector(`[data-addfilm="${periode.id}"]`);
  if (!btn) return;

  btn.disabled = !periode.debut || !periode.fin;
}

// =======================
// TOGGLE
// =======================
function togglePeriode(id) {
  const p = state.periodes.find(p => p.id === id);
  if (!p) return;

  p.ui.open = !p.ui.open;
  render();
}

function toggleFilm(periodeId, filmId) {
  const p = state.periodes.find(p => p.id === periodeId);
  if (!p) return;

  const f = p.films.find(f => f.id === filmId);
  if (!f) return;

  f.ui.open = !f.ui.open;
  render();
}

// =======================
// EXPORT
// =======================
function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "programmation.json";
  a.click();

  URL.revokeObjectURL(url);
}

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const save = document.getElementById("saveBtn");
  if (save) save.addEventListener("click", exportJSON);

  const importInput = document.getElementById("importFile");
  if (importInput) {
    importInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const text = await file.text();

      try {
        const data = JSON.parse(text);
        state.periodes = normalizeData(data);
        render();
      } catch {
        alert("JSON invalide");
      }

      e.target.value = "";
    });
  }

  render();
});

// =======================
// NORMALIZE
// =======================
function normalizeData(data) {
  return (data.periodes || []).map(p => ({
    id: p.id || createId(),
    debut: p.debut || "",
    fin: p.fin || "",
    films: (p.films || []).map(f => ({
      id: f.id || createId(),
      titre: f.titre || "",
      age: f.age || "",
      horaires: f.horaires || {},
      ui: f.ui || { open: true }
    })),
    ui: p.ui || { open: true }
  }));
}

// =======================
// MENU SAFE
// =======================
function toggleMenu() {
  const menu = document.getElementById("menuDropdown");
  if (!menu) return;

  menu.classList.toggle("hidden");
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("menuDropdown");
  const btn = document.querySelector(".menu-btn");

  if (!menu || !btn) return;

  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

function renderPDFPreview() {

  const preview = document.getElementById("pdf-preview");
  if (!preview) return;

  const jours = [
    "Dim.",
    "Lun.",
    "Mar.",
    "Mer.",
    "Jeu.",
    "Ven.",
    "Sam."
  ];

  const mois = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre"
  ];

  function formatHeaderDate(dateStr) {

    const d = new Date(dateStr);

    return `${jours[d.getDay()]} ${d.getDate()}`;
  }

  function formatPeriode(debut, fin) {

    if (!debut || !fin) return "PÉRIODE";

    const d1 = new Date(debut);
    const d2 = new Date(fin);

    return `
      ${jours[d1.getDay()].toUpperCase()}
      ${d1.getDate()}
      ${mois[d1.getMonth()].toUpperCase()}
      AU
      ${jours[d2.getDay()].toUpperCase()}
      ${d2.getDate()}
      ${mois[d2.getMonth()].toUpperCase()}
      ${d2.getFullYear()}
    `;
  }

  let html = `
    <div class="cinema-sheet">

      <div class="cinema-header">

        <div class="cinema-logo">
          🎞️
        </div>

        <div class="cinema-title">
          <div class="small">CINÉMA</div>
          <div class="big">LA BOBINE</div>
          <div class="city">PONTCHÂTEAU</div>
        </div>

      </div>

      <div class="cinema-infos">

        <div class="cinema-tarifs">
          TARIFS : Adulte : 6,00 € • Réduit : 4,50 € • -14 ans : 4 €
        </div>

        <div class="cinema-special">
          * Le dimanche à 11 h : 4 € • Carte 10 Entrées : 45 €
        </div>

        <div class="cinema-promo">
          Le premier mardi soir de chaque mois, une place de cinéma à gagner par tirage au sort.
        </div>

      </div>
  `;

  state.periodes.forEach((p) => {

    const dates = getDates(p.debut, p.fin);

    html += `
      <div class="periode-print">

        <div class="periode-print-title">
          ${formatPeriode(p.debut, p.fin)}
        </div>

        <table class="programme-table">

          <thead>
            <tr>

              <th class="film-col">
                FILMS
              </th>

              ${dates.map(d => `
                <th>
                  ${formatHeaderDate(d)}
                </th>
              `).join("")}

            </tr>
          </thead>

          <tbody>
    `;

    p.films.forEach((f) => {

      html += `
        <tr>

          <td class="film-title-cell">

            <div class="film-line">

              <div class="film-title">
                ${f.titre || "FILM"}
              </div>

              ${f.age
                ? `
                  <div class="film-age">
                    ${f.age}
                  </div>
                `
                : ""
              }

            </div>

          </td>
      `;

      dates.forEach((d) => {

        const horaires = f.horaires?.[d] || [];

        html += `
          <td class="horaire-cell">
            ${horaires.join("<br>")}
          </td>
        `;
      });

      html += `
        </tr>
      `;
    });

    html += `
          </tbody>

        </table>

      </div>
    `;
  });

  html += `
      <div class="cinema-footer">
        6 place de la Gare - 44160 PONTCHÂTEAU - Tél. 02 40 45 67 20
		www.labobine.eu
      </div>

    </div>
  `;

  preview.innerHTML = html;
}

function exportPDF() {
  window.print();
}

function openPeriodeModal(id = null) {
  const isEdit = !!id;
  const periode = isEdit
    ? state.periodes.find(p => p.id === id)
    : { debut: "", fin: "" };

  const modalBody = document.getElementById("modal-body");

  modalBody.innerHTML = `
    <h3>${isEdit ? "Modifier période" : "Nouvelle période"}</h3>

    <label>Début</label>
    <input id="m-debut" type="date" value="${periode.debut}" />

    <label>Fin</label>
    <input id="m-fin" type="date" value="${periode.fin}" />

    <div style="margin-top:15px; display:flex; gap:10px;">
      <button onclick="closeModal()">Annuler</button>

      <button id="btn-save-periode" class="primary" disabled>
        Valider
      </button>
    </div>
  `;

  showModal();

  document.getElementById("m-debut")
    .addEventListener("input", validatePeriodeModal);

  document.getElementById("m-fin")
    .addEventListener("input", validatePeriodeModal);

  document.getElementById("btn-save-periode")
    .addEventListener("click", () => savePeriodeModal(id));

  validatePeriodeModal();
}

function savePeriodeModal(id) {
  const debut = document.getElementById("m-debut").value;
  const fin = document.getElementById("m-fin").value;

  if (id) {
    const p = state.periodes.find(p => p.id === id);
    p.debut = debut;
    p.fin = fin;
  } else {
    state.periodes.push({
      id: createId(),
      debut,
      fin,
      films: [],
      ui: { open: true }
    });
  }

  closeModal();
  render();
}

function openFilmModal(periodeId, filmId = "") {

  const periode = state.periodes.find(p => p.id === periodeId);
  if (!periode) return;

  const film = filmId
    ? periode.films.find(f => f.id === filmId)
    : { titre: "", age: "", horaires: {} };

  const dates = getDates(periode.debut, periode.fin);

  const modalBody = document.getElementById("modal-body");

  modalBody.innerHTML = `
    <h3>${filmId ? "Modifier film" : "Nouveau film"}</h3>

    <label>Titre</label>
    <input id="m-titre" value="${film.titre}" />

    <label>Âge</label>
    <input id="m-age" value="${film.age}" />

    <hr style="margin:15px 0;" />

    <h4>Horaires des séances</h4>

    <div class="horaires-modal">

      ${dates.map(date => `
        <div class="horaire-day">

          <label>${date}</label>

          <input
            type="text"
            data-date="${date}"
            class="m-horaire"
            placeholder="ex: 14:00, 20:30"
            value="${(film.horaires?.[date] || []).join(", ")}"
          />

        </div>
      `).join("")}

    </div>

    <div style="margin-top:15px; display:flex; gap:10px;">
      <button onclick="closeModal()">Annuler</button>
      <button class="primary" onclick="saveFilmModal('${periodeId}','${filmId || ""}')">
        Valider
      </button>
    </div>
  `;

  showModal();
}

function saveFilmModal(periodeId, filmId = "") {

  const periode = state.periodes.find(p => p.id === periodeId);
  if (!periode) return;

  const titre = document.getElementById("m-titre").value;
  const age = document.getElementById("m-age").value;

  // =======================
  // EDIT EXISTING FILM
  // =======================
  if (filmId) {

    const film = periode.films.find(f => f.id === filmId);
    if (!film) return;

    film.titre = titre;
    film.age = age;
  }

  // =======================
  // CREATE NEW FILM
  // =======================
  else {

    periode.films.push({
      id: createId(),
      titre,
      age,
      horaires: {},
      ui: { open: true }
    });
  }

  closeModal();
  render();
}

function validatePeriodeModal() {
  const debutEl = document.getElementById("m-debut");
  const finEl = document.getElementById("m-fin");
  const btn = document.getElementById("btn-save-periode");

  if (!debutEl || !finEl || !btn) return;

  const debut = debutEl.value;
  const fin = finEl.value;

  const isValid =
    debut !== "" &&
    fin !== "" &&
    new Date(fin) >= new Date(debut);

  btn.disabled = !isValid;
}

// =======================
// DRAG & DROP FILMS
// =======================

let dragPreviewPosition = null;

function handleDragStart(event, periodeId, filmId) {

  draggedFilmId = filmId;

  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", filmId);

  event.currentTarget.classList.add("dragging");
}

function handleDragEnd() {

  document
    .querySelectorAll(".film")
    .forEach(el => {
      el.classList.remove(
        "drag-over-top",
        "drag-over-bottom",
        "dragging"
      );
    });

  dragPreviewPosition = null;
}

function handleDragOver(event) {

  event.preventDefault();

  const filmEl = event.currentTarget;
  const rect = filmEl.getBoundingClientRect();

  const offsetY = event.clientY - rect.top;
  const isTop = offsetY < rect.height / 2;

  document
    .querySelectorAll(".film")
    .forEach(el => {
      el.classList.remove(
        "drag-over-top",
        "drag-over-bottom"
      );
    });

  if (isTop) {
    filmEl.classList.add("drag-over-top");
  } else {
    filmEl.classList.add("drag-over-bottom");
  }

  dragPreviewPosition = {
    targetFilmId: filmEl.dataset.filmId,
    position: isTop ? "before" : "after"
  };
}

function handleDrop(event, periodeId, targetFilmId) {

  event.preventDefault();

  const periode = state.periodes.find(p => p.id === periodeId);
  if (!periode) return;

  const sourceIndex =
    periode.films.findIndex(f => f.id === draggedFilmId);

  const targetIndex =
    periode.films.findIndex(f => f.id === targetFilmId);

  if (sourceIndex === -1 || targetIndex === -1) return;

  const [movedFilm] =
    periode.films.splice(sourceIndex, 1);

  let insertIndex = targetIndex;

  if (
    dragPreviewPosition &&
    dragPreviewPosition.position === "after"
  ) {
    insertIndex++;
  }

  // correction index après splice
  if (sourceIndex < insertIndex) {
    insertIndex--;
  }

  periode.films.splice(insertIndex, 0, movedFilm);

  dragPreviewPosition = null;

  render();
}

function showModal() {

  document
    .getElementById("modal")
    .classList.remove("hidden");

  document.body.classList.add("modal-open");
}

function closeModal() {

  document
    .getElementById("modal")
    .classList.add("hidden");

  document.body.classList.remove("modal-open");
}