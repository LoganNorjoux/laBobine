const state = {
  periodes: []
};

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

        <button type="button"
		  class="delete-btn"
		  onclick="event.stopPropagation(); removePeriode('${p.id}')">

		  <span class="material-symbols-outlined">
			delete
		  </span>

		</button>
      </div>

      <div class="periode-body ${p.ui.open ? "" : "collapsed"}">

        <div class="two-cols">
          <div class="field-item">
            <label>Début</label>
            <input type="date"
              value="${p.debut}"
              data-periode-id="${p.id}"
              data-field="debut" />
          </div>

          <div class="field-item">
            <label>Fin</label>
            <input type="date"
              value="${p.fin}"
              data-periode-id="${p.id}"
              data-field="fin" />
          </div>
        </div>

        <div class="films">

          ${p.films.map(f => `
            <div class="film">

              <div class="film-header" onclick="toggleFilm('${p.id}','${f.id}')">
                <h3 data-film-title-id="${f.id}">
                  ${f.titre || "Film"}${f.age ? ` (${f.age})` : ""}
                </h3>

				<button type="button"
				  class="delete-btn"
				  onclick="event.stopPropagation(); removeFilm('${p.id}','${f.id}')">

				  <span class="material-symbols-outlined">
					delete
				  </span>

				</button>
              </div>
              <div class="film-body ${f.ui.open ? "" : "collapsed"}">

                <div class="two-cols">
                  <div class="field-item">
                    <label>Titre</label>
                    <input value="${f.titre}"
                      data-film-id="${f.id}"
                      data-periode-id="${p.id}"
                      data-field="titre" />
                  </div>

                  <div class="field-item">
                    <label>Âge</label>
                    <input value="${f.age}"
                      data-film-id="${f.id}"
                      data-periode-id="${p.id}"
                      data-field="age" />
                  </div>
                </div>

                <div class="horaires">
                  ${dates.map(d => `
                    <div class="field-item">
                      <label>${d}</label>
                      <input value="${(f.horaires[d] || []).join(", ")}"
                        data-film-id="${f.id}"
                        data-periode-id="${p.id}"
                        data-date="${d}"
                        data-field="horaire" />
                    </div>
                  `).join("")}
                </div>

              </div>
            </div>
          `).join("")}

        </div>

        <button type="button"
          class="primary"
          data-addfilm="${p.id}"
          onclick="addFilm('${p.id}')"
          ${!p.debut || !p.fin ? "disabled title='Saisis les dates'" : ""}>
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