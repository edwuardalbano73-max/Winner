const STORAGE_KEY = "football_manager_v2";

let data = loadData();


// =====================================================
// DATOS
// =====================================================

function defaultData() {
  return {
    teams: [],
    players: [],
    competitions: [],
    matches: []
  };
}


function loadData() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultData();
    }

    const parsed = JSON.parse(saved);

    return {
      teams: parsed.teams || [],
      players: parsed.players || [],
      competitions: parsed.competitions || [],
      matches: parsed.matches || []
    };

  } catch (error) {

    console.error(error);

    return defaultData();
  }
}


function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


function createId(prefix = "id") {

  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
}


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function getTeam(id) {
  return data.teams.find(t => t.id === id);
}


function getCompetition(id) {
  return data.competitions.find(c => c.id === id);
}


// =====================================================
// NAVEGACIÓN
// =====================================================

document.querySelectorAll(".nav-btn").forEach(button => {

  button.addEventListener("click", () => {

    const section = button.dataset.section;

    showSection(section);

  });

});


function showSection(section) {

  document.querySelectorAll(".page-section")
    .forEach(s => s.classList.remove("active"));

  document.querySelectorAll(".nav-btn")
    .forEach(b => b.classList.remove("active"));

  const target = document.getElementById(section);

  if (target) {
    target.classList.add("active");
  }

  const nav = document.querySelector(
    `.nav-btn[data-section="${section}"]`
  );

  if (nav) {
    nav.classList.add("active");
  }

  const titles = {
    inicio: "Inicio",
    equipos: "Equipos",
    jugadores: "Jugadores",
    competiciones: "Competiciones",
    calendarios: "Calendarios",
    partidos: "Partidos",
    estadisticas: "Estadísticas"
  };

  document.getElementById("pageTitle").textContent =
    titles[section] || "Football Manager";

  renderAll();
}


// =====================================================
// MODAL
// =====================================================

function openModal(title, content) {

  document.getElementById("modalTitle").textContent = title;

  document.getElementById("modalContent").innerHTML = content;

  document.getElementById("modal").classList.add("show");
}


function closeModal() {

  document.getElementById("modal").classList.remove("show");
}


document.getElementById("modal").addEventListener("click", event => {

  if (event.target.id === "modal") {
    closeModal();
  }

});


// =====================================================
// EQUIPOS
// =====================================================

function openTeamModal() {

  openModal(
    "Crear equipo",
    `
      <form onsubmit="createTeam(event)">

        <div class="form-group">
          <label>Nombre del equipo</label>
          <input
            id="teamName"
            required
            placeholder="Ej: Barcelona"
          >
        </div>

        <div class="form-group">
          <label>Nombre corto</label>
          <input
            id="teamShort"
            maxlength="5"
            placeholder="Ej: BAR"
          >
        </div>

        <div class="form-group">
          <label>Fuerza del equipo: <span id="ratingValue">70</span></label>

          <input
            id="teamRating"
            type="range"
            min="1"
            max="100"
            value="70"
            oninput="document.getElementById('ratingValue').textContent=this.value"
          >

          <small class="card-muted">
            Esta valoración influirá en los resultados 🎲.
          </small>
        </div>

        <button class="primary-btn form-submit">
          Crear equipo
        </button>

      </form>
    `
  );
}


function createTeam(event) {

  event.preventDefault();

  const name = document.getElementById("teamName").value.trim();
  const shortName =
    document.getElementById("teamShort").value.trim().toUpperCase();

  const rating =
    Number(document.getElementById("teamRating").value);

  if (!name) return;

  data.teams.push({

    id: createId("team"),

    name,

    shortName:
      shortName ||
      name.substring(0, 3).toUpperCase(),

    rating,

    createdAt: new Date().toISOString()

  });

  saveData();

  closeModal();

  renderAll();
}


function deleteTeam(id) {

  const hasPlayers =
    data.players.some(p => p.teamId === id);

  const hasMatches =
    data.matches.some(
      m => m.homeId === id || m.awayId === id
    );

  if (hasPlayers || hasMatches) {

    alert(
      "No puedes eliminar este equipo porque está siendo utilizado por jugadores o partidos."
    );

    return;
  }

  if (!confirm("¿Eliminar este equipo?")) return;

  data.teams =
    data.teams.filter(t => t.id !== id);

  data.competitions.forEach(c => {

    c.teamIds =
      c.teamIds.filter(teamId => teamId !== id);

  });

  saveData();

  renderAll();
}


// =====================================================
// JUGADORES
// =====================================================

function openPlayerModal() {

  if (data.teams.length === 0) {

    alert("Primero debes crear al menos un equipo.");

    return;
  }

  const teamOptions = data.teams
    .map(t =>
      `<option value="${t.id}">
        ${escapeHTML(t.name)}
      </option>`
    )
    .join("");

  openModal(
    "Crear jugador",
    `
      <form onsubmit="createPlayer(event)">

        <div class="form-group">
          <label>Nombre</label>

          <input
            id="playerName"
            required
            placeholder="Ej: Juan Pérez"
          >
        </div>

        <div class="form-grid">

          <div class="form-group">

            <label>Posición</label>

            <select id="playerPosition">

              <option>POR</option>
              <option>DEF</option>
              <option>MC</option>
              <option>EXT</option>
              <option>DEL</option>

            </select>

          </div>

          <div class="form-group">

            <label>Número</label>

            <input
              id="playerNumber"
              type="number"
              min="1"
              max="99"
              value="10"
            >

          </div>

        </div>

        <div class="form-group">

          <label>Equipo</label>

          <select id="playerTeam">

            ${teamOptions}

          </select>

        </div>

        <div class="form-group">

          <label>Valoración</label>

          <input
            id="playerRating"
            type="number"
            min="1"
            max="100"
            value="70"
          >

        </div>

        <button class="primary-btn form-submit">
          Crear jugador
        </button>

      </form>
    `
  );
}


function createPlayer(event) {

  event.preventDefault();

  data.players.push({

    id: createId("player"),

    name:
      document.getElementById("playerName")
        .value.trim(),

    position:
      document.getElementById("playerPosition")
        .value,

    number:
      Number(
        document.getElementById("playerNumber")
          .value
      ),

    teamId:
      document.getElementById("playerTeam")
        .value,

    rating:
      Number(
        document.getElementById("playerRating")
          .value
      )

  });

  saveData();

  closeModal();

  renderAll();
}


function deletePlayer(id) {

  if (!confirm("¿Eliminar este jugador?")) return;

  data.players =
    data.players.filter(p => p.id !== id);

  saveData();

  renderAll();
}


// =====================================================
// COMPETICIONES
// =====================================================

function openCompetitionModal(existingId = null) {

  if (data.teams.length < 2) {

    alert(
      "Necesitas al menos 2 equipos para crear una competición."
    );

    return;
  }

  const existing =
    existingId
      ? getCompetition(existingId)
      : null;

  const selectedIds =
    existing?.teamIds || [];

  const teamCheckboxes = data.teams
    .map(team => {

      const checked =
        selectedIds.includes(team.id)
          ? "checked"
          : "";

      return `
        <label class="team-check">

          <input
            type="checkbox"
            name="competitionTeams"
            value="${team.id}"
            ${checked}
          >

          <span>
            ${escapeHTML(team.name)}
            <small class="card-muted">
              (${team.rating})
            </small>
          </span>

        </label>
      `;

    })
    .join("");

  openModal(
    existing
      ? "Editar competición"
      : "Crear competición",

    `
      <form onsubmit="${existing ? `updateCompetition(event, '${existing.id}')` : "createCompetition(event)"}">

        <div class="form-group">

          <label>Nombre</label>

          <input
            id="competitionName"
            required
            value="${existing ? escapeHTML(existing.name) : ""}"
            placeholder="Ej: Liga Nacional"
          >

        </div>

        <div class="form-group">

          <label>Tipo</label>

          <select id="competitionType">

            <option
              value="Liga"
              ${existing?.type === "Liga" ? "selected" : ""}
            >
              Liga
            </option>

            <option
              value="Campeonato"
              ${existing?.type === "Campeonato" ? "selected" : ""}
            >
              Campeonato / Copa
            </option>

          </select>

        </div>

        <div class="form-group">

          <label>Equipos participantes</label>

          <div class="team-selection">

            ${teamCheckboxes}

          </div>

        </div>

        <div class="notice">

          💡 Las ligas pueden generar calendarios de ida o ida y vuelta.
          Los campeonatos también pueden utilizar los equipos seleccionados
          para crear partidos y posiciones.

        </div>

        <button class="primary-btn form-submit">

          ${existing ? "Guardar cambios" : "Crear competición"}

        </button>

      </form>
    `
  );
}


function getSelectedCompetitionTeams() {

  return [
    ...document.querySelectorAll(
      'input[name="competitionTeams"]:checked'
    )
  ].map(input => input.value);

}


function createCompetition(event) {

  event.preventDefault();

  const teamIds =
    getSelectedCompetitionTeams();

  if (teamIds.length < 2) {

    alert(
      "Selecciona al menos 2 equipos."
    );

    return;
  }

  data.competitions.push({

    id: createId("competition"),

    name:
      document.getElementById("competitionName")
        .value.trim(),

    type:
      document.getElementById("competitionType")
        .value,

    teamIds,

    calendarGenerated: false,

    rounds: [],

    createdAt:
      new Date().toISOString()

  });

  saveData();

  closeModal();

  renderAll();
}


function updateCompetition(event, id) {

  event.preventDefault();

  const competition =
    getCompetition(id);

  if (!competition) return;

  const teamIds =
    getSelectedCompetitionTeams();

  if (teamIds.length < 2) {

    alert("Selecciona al menos 2 equipos.");

    return;
  }

  competition.name =
    document.getElementById("competitionName")
      .value.trim();

  competition.type =
    document.getElementById("competitionType")
      .value;

  competition.teamIds =
    teamIds;

  // Si cambian los equipos, el calendario anterior
  // deja de ser válido.
  competition.calendarGenerated = false;
  competition.rounds = [];

  saveData();

  closeModal();

  renderAll();
}


function deleteCompetition(id) {

  const used =
    data.matches.some(
      m => m.competitionId === id
    );

  if (used) {

    alert(
      "No puedes eliminar una competición que ya tiene partidos."
    );

    return;
  }

  if (!confirm("¿Eliminar esta competición?")) return;

  data.competitions =
    data.competitions.filter(
      c => c.id !== id
    );

  saveData();

  renderAll();
}


// =====================================================
// RESULTADOS ALEATORIOS
// =====================================================

function clamp(value, min, max) {

  return Math.max(min, Math.min(max, value));

}


function randomFrom(array) {

  return array[
    Math.floor(Math.random() * array.length)
  ];

}


function generateRandomScore(home, away) {

  const homeRating =
    Number(home.rating || 70);

  const awayRating =
    Number(away.rating || 70);

  const difference =
    homeRating - awayRating;

  // Ventaja de local
  let homeWin =
    0.43 + difference / 250;

  let awayWin =
    0.29 - difference / 250;

  let draw =
    1 - homeWin - awayWin;

  homeWin =
    clamp(homeWin, 0.15, 0.72);

  awayWin =
    clamp(awayWin, 0.15, 0.60);

  draw =
    clamp(draw, 0.15, 0.35);

  const total =
    homeWin + awayWin + draw;

  homeWin /= total;
  awayWin /= total;
  draw /= total;

  const random =
    Math.random();

  let outcome;

  if (random < homeWin) {

    outcome = "home";

  } else if (random < homeWin + draw) {

    outcome = "draw";

  } else {

    outcome = "away";

  }


  if (outcome === "draw") {

    return randomFrom([
      [0, 0],
      [1, 1],
      [1, 1],
      [2, 2],
      [2, 2],
      [3, 3]
    ]);

  }


  if (outcome === "home") {

    const scores = [
      [1, 0],
      [2, 0],
      [2, 1],
      [2, 1],
      [3, 0],
      [3, 1],
      [3, 2],
      [4, 1],
      [4, 2],
      [5, 1]
    ];

    let score =
      randomFrom(scores);

    // Si la diferencia de fuerza es enorme,
    // favorecemos una victoria más clara.
    if (difference >= 25 && Math.random() < 0.45) {

      score = randomFrom([
        [2, 0],
        [3, 0],
        [3, 1],
        [4, 0],
        [4, 1],
        [5, 1]
      ]);

    }

    return score;
  }


  const scores = [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [1, 4],
    [2, 4]
  ];

  let score =
    randomFrom(scores);

  if (difference <= -25 && Math.random() < 0.45) {

    score = randomFrom([
      [0, 2],
      [0, 3],
      [1, 3],
      [0, 4],
      [1, 4]
    ]);

  }

  return score;
}


// =====================================================
// PARTIDOS
// =====================================================

function openMatchModal() {

  if (data.competitions.length === 0) {

    alert(
      "Primero crea una competición."
    );

    return;
  }

  const competitionOptions =
    data.competitions
      .map(c =>
        `<option value="${c.id}">
          ${escapeHTML(c.name)} — ${escapeHTML(c.type)}
        </option>`
      )
      .join("");

  openModal(
    "Crear partido",

    `
      <form onsubmit="createMatch(event)">

        <div class="form-group">

          <label>Competición</label>

          <select
            id="matchCompetition"
            onchange="updateMatchTeams()"
            required
          >

            <option value="">
              Selecciona una competición
            </option>

            ${competitionOptions}

          </select>

        </div>

        <div id="matchTeamSelectors">

          <div class="notice">
            Selecciona una competición para elegir los equipos.
          </div>

        </div>

        <div class="form-grid">

          <div class="form-group">

            <label>Fecha</label>

            <input
              id="matchDate"
              type="date"
              value="${new Date().toISOString().split("T")[0]}"
              required
            >

          </div>

          <div class="form-group">

            <label>Hora</label>

            <input
              id="matchTime"
              type="time"
              value="20:00"
            >

          </div>

        </div>

        <div class="form-group">

          <label>Tipo de resultado</label>

          <select
            id="resultMode"
            onchange="toggleManualScore()"
          >

            <option value="random">
              🎲 Resultado al azar
            </option>

            <option value="manual">
              ✍️ Resultado manual
            </option>

          </select>

        </div>

        <div id="manualScoreArea" style="display:none;">

          <div class="form-grid">

            <div class="form-group">

              <label>Goles local</label>

              <input
                id="homeScore"
                type="number"
                min="0"
                max="30"
                value="0"
              >

            </div>

            <div class="form-group">

              <label>Goles visitante</label>

              <input
                id="awayScore"
                type="number"
                min="0"
                max="30"
                value="0"
              >

            </div>

          </div>

        </div>

        <div id="randomInfo" class="notice">

          🎲 El resultado se calculará teniendo en cuenta
          la fuerza de ambos equipos.

        </div>

        <button class="primary-btn form-submit">
          Crear partido
        </button>

      </form>
    `
  );
}


function updateMatchTeams() {

  const competitionId =
    document.getElementById("matchCompetition")
      .value;

  const container =
    document.getElementById("matchTeamSelectors");

  if (!competitionId) {

    container.innerHTML = `
      <div class="notice">
        Selecciona una competición.
      </div>
    `;

    return;
  }

  const competition =
    getCompetition(competitionId);

  if (!competition) return;

  const teams =
    competition.teamIds
      .map(id => getTeam(id))
      .filter(Boolean);

  if (teams.length < 2) {

    container.innerHTML = `
      <div class="notice">
        Esta competición necesita al menos 2 equipos.
      </div>
    `;

    return;
  }

  const options =
    teams.map(t =>
      `<option value="${t.id}">
        ${escapeHTML(t.name)} — Fuerza ${t.rating}
      </option>`
    ).join("");

  container.innerHTML = `

    <div class="form-grid">

      <div class="form-group">

        <label>Equipo local</label>

        <select id="homeTeam" required>

          <option value="">
            Seleccionar
          </option>

          ${options}

        </select>

      </div>

      <div class="form-group">

        <label>Equipo visitante</label>

        <select id="awayTeam" required>

          <option value="">
            Seleccionar
          </option>

          ${options}

        </select>

      </div>

    </div>

  `;
}


function toggleManualScore() {

  const mode =
    document.getElementById("resultMode").value;

  const manual =
    document.getElementById("manualScoreArea");

  const info =
    document.getElementById("randomInfo");

  if (mode === "manual") {

    manual.style.display = "block";

    info.innerHTML =
      "✍️ Tú decidirás exactamente el resultado.";

  } else {

    manual.style.display = "none";

    info.innerHTML =
      "🎲 El resultado se calculará teniendo en cuenta la fuerza de ambos equipos.";

  }
}


function createMatch(event) {

  event.preventDefault();

  const competitionId =
    document.getElementById("matchCompetition")
      .value;

  const homeId =
    document.getElementById("homeTeam")?.value;

  const awayId =
    document.getElementById("awayTeam")?.value;

  if (!homeId || !awayId) {

    alert("Selecciona los dos equipos.");

    return;
  }

  if (homeId === awayId) {

    alert(
      "El equipo local y visitante deben ser diferentes."
    );

    return;
  }

  const competition =
    getCompetition(competitionId);

  const home =
    getTeam(homeId);

  const away =
    getTeam(awayId);

  if (!competition || !home || !away) return;

  const mode =
    document.getElementById("resultMode")
      .value;

  let homeScore;
  let awayScore;

  if (mode === "manual") {

    homeScore =
      Number(
        document.getElementById("homeScore")
          .value
      );

    awayScore =
      Number(
        document.getElementById("awayScore")
          .value
      );

  } else {

    const result =
      generateRandomScore(home, away);

    homeScore = result[0];
    awayScore = result[1];

  }

  const date =
    document.getElementById("matchDate")
      .value;

  const time =
    document.getElementById("matchTime")
      .value;

  data.matches.push({

    id: createId("match"),

    competitionId,

    homeId,

    awayId,

    homeScore,

    awayScore,

    mode,

    date,

    time,

    played: true,

    createdAt:
      new Date().toISOString()

  });

  saveData();

  closeModal();

  renderAll();
}


// =====================================================
// CALENDARIO AUTOMÁTICO
// =====================================================

function generateCalendar(competitionId, doubleRound = false) {

  const competition =
    getCompetition(competitionId);

  if (!competition) return;

  const teams =
    competition.teamIds
      .map(id => getTeam(id))
      .filter(Boolean);

  if (teams.length < 2) {

    alert(
      "Necesitas al menos 2 equipos."
    );

    return;
  }

  // Si hay número impar agregamos un descanso.
  let rotation =
    [...teams];

  let bye = null;

  if (rotation.length % 2 !== 0) {

    bye = {
      id: "BYE",
      name: "DESCANSA"
    };

    rotation.push(bye);
  }

  const rounds = [];

  const numberOfTeams =
    rotation.length;

  const matchesPerRound =
    numberOfTeams / 2;

  const totalRounds =
    numberOfTeams - 1;


  for (let round = 0; round < totalRounds; round++) {

    const roundMatches = [];

    for (
      let i = 0;
      i < matchesPerRound;
      i++
    ) {

      const first =
        rotation[i];

      const second =
        rotation[numberOfTeams - 1 - i];

      if (
        first.id === "BYE" ||
        second.id === "BYE"
      ) {
        continue;
      }

      let home;
      let away;

      if (i === 0) {

        if (round % 2 === 0) {

          home = first;
          away = second;

        } else {

          home = second;
          away = first;

        }

      } else {

        if (round % 2 === 0) {

          home = second;
          away = first;

        } else {

          home = first;
          away = second;

        }

      }

      roundMatches.push({

        homeId: home.id,

        awayId: away.id

      });

    }

    rounds.push({

      number: round + 1,

      matches: roundMatches

    });


    // Sistema de rotación.
    const fixed =
      rotation[0];

    const rotating =
      rotation.slice(1);

    rotating.unshift(
      rotating.pop()
    );

    rotation =
      [fixed, ...rotating];

  }


  if (doubleRound) {

    const secondLeg =
      rounds.map((round, index) => ({

        number:
          rounds.length + index + 1,

        matches:
          round.matches.map(match => ({

            homeId:
              match.awayId,

            awayId:
              match.homeId

          }))

      }));

    rounds.push(...secondLeg);
  }


  // Guardamos el calendario.
  competition.rounds = rounds;

  competition.calendarGenerated = true;

  // Crear partidos del calendario que todavía no existan.
  const startDate =
    new Date();

  rounds.forEach((round, roundIndex) => {

    round.matches.forEach(match => {

      const exists =
        data.matches.some(m =>
          m.competitionId === competition.id &&
          m.homeId === match.homeId &&
          m.awayId === match.awayId
        );

      if (exists) return;

      const date =
        new Date(startDate);

      date.setDate(
        date.getDate() +
        roundIndex * 7
      );

      data.matches.push({

        id: createId("match"),

        competitionId:
          competition.id,

        homeId:
          match.homeId,

        awayId:
          match.awayId,

        homeScore:
          null,

        awayScore:
          null,

        mode:
          "calendar",

        date:
          date.toISOString()
            .split("T")[0],

        time:
          "20:00",

        played:
          false,

        round:
          round.number,

        createdAt:
          new Date().toISOString()

      });

    });

  });

  saveData();

  renderAll();

  alert(
    doubleRound
      ? "Calendario de ida y vuelta generado."
      : "Calendario generado correctamente."
  );
}


function randomizeCalendar(competitionId) {

  const competition =
    getCompetition(competitionId);

  if (!competition) return;

  // Mezclamos los equipos antes de crear el calendario.
  competition.teamIds =
    [...competition.teamIds]
      .sort(() => Math.random() - 0.5);

  generateCalendar(
    competitionId,
    false
  );
}


// =====================================================
// JUGAR PARTIDO DEL CALENDARIO
// =====================================================

function playCalendarMatch(matchId) {

  const match =
    data.matches.find(
      m => m.id === matchId
    );

  if (!match) return;

  if (match.played) {

    alert("Este partido ya tiene resultado.");

    return;
  }

  const home =
    getTeam(match.homeId);

  const away =
    getTeam(match.awayId);

  if (!home || !away) return;

  const result =
    generateRandomScore(
      home,
      away
    );

  match.homeScore =
    result[0];

  match.awayScore =
    result[1];

  match.played =
    true;

  match.mode =
    "random";

  saveData();

  renderAll();
}


function manualCalendarResult(matchId) {

  const match =
    data.matches.find(
      m => m.id === matchId
    );

  if (!match) return;

  const home =
    getTeam(match.homeId);

  const away =
    getTeam(match.awayId);

  if (!home || !away) return;

  openModal(
    "Resultado del partido",

    `
      <form onsubmit="saveCalendarManualResult(event, '${matchId}')">

        <div class="notice">

          ${escapeHTML(home.name)}
          vs
          ${escapeHTML(away.name)}

        </div>

        <div class="form-grid">

          <div class="form-group">

            <label>${escapeHTML(home.name)}</label>

            <input
              id="calendarHomeScore"
              type="number"
              min="0"
              max="30"
              value="0"
              required
            >

          </div>

          <div class="form-group">

            <label>${escapeHTML(away.name)}</label>

            <input
              id="calendarAwayScore"
              type="number"
              min="0"
              max="30"
              value="0"
              required
            >

          </div>

        </div>

        <button class="primary-btn form-submit">
          Guardar resultado
        </button>

      </form>
    `
  );
}


function saveCalendarManualResult(event, matchId) {

  event.preventDefault();

  const match =
    data.matches.find(
      m => m.id === matchId
    );

  if (!match) return;

  match.homeScore =
    Number(
      document.getElementById(
        "calendarHomeScore"
      ).value
    );

  match.awayScore =
    Number(
      document.getElementById(
        "calendarAwayScore"
      ).value
    );

  match.played =
    true;

  match.mode =
    "manual";

  saveData();

  closeModal();

  renderAll();
}


// =====================================================
// TABLA DE POSICIONES
// =====================================================

function getStandings(competitionId) {

  const competition =
    getCompetition(competitionId);

  if (!competition) return [];

  const table =
    competition.teamIds
      .map(teamId => {

        const team =
          getTeam(teamId);

        return {

          teamId,

          name:
            team?.name || "Equipo eliminado",

          played: 0,

          wins: 0,

          draws: 0,

          losses: 0,

          gf: 0,

          gc: 0,

          gd: 0,

          points: 0

        };

      });


  const map =
    new Map(
      table.map(row => [
        row.teamId,
        row
      ])
    );


  data.matches
    .filter(
      match =>
        match.competitionId === competitionId &&
        match.played &&
        match.homeScore !== null &&
        match.awayScore !== null
    )
    .forEach(match => {

      const home =
        map.get(match.homeId);

      const away =
        map.get(match.awayId);

      if (!home || !away) return;

      home.played++;
      away.played++;

      home.gf +=
        Number(match.homeScore);

      home.gc +=
        Number(match.awayScore);

      away.gf +=
        Number(match.awayScore);

      away.gc +=
        Number(match.homeScore);


      if (
        match.homeScore >
        match.awayScore
      ) {

        home.wins++;
        away.losses++;

        home.points += 3;

      } else if (
        match.homeScore <
        match.awayScore
      ) {

        away.wins++;
        home.losses++;

        away.points += 3;

      } else {

        home.draws++;
        away.draws++;

        home.points++;
        away.points++;

      }

    });


  table.forEach(row => {

    row.gd =
      row.gf - row.gc;

  });


  table.sort((a, b) => {

    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.gd !== a.gd) {
      return b.gd - a.gd;
    }

    if (b.gf !== a.gf) {
      return b.gf - a.gf;
    }

    return a.name.localeCompare(
      b.name
    );

  });


  return table;
}


function standingsHTML(competitionId) {

  const standings =
    getStandings(competitionId);

  if (standings.length === 0) {

    return `
      <div class="empty">
        No hay equipos en esta competición.
      </div>
    `;

  }

  return `

    <div class="table-wrapper">

      <table class="standings">

        <thead>

          <tr>

            <th>#</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>GF</th>
            <th>GC</th>
            <th>DG</th>
            <th>PTS</th>

          </tr>

        </thead>

        <tbody>

          ${standings.map((row, index) => `

            <tr>

              <td class="position">
                ${index + 1}
              </td>

              <td>
                ${escapeHTML(row.name)}
              </td>

              <td>${row.played}</td>
              <td>${row.wins}</td>
              <td>${row.draws}</td>
              <td>${row.losses}</td>
              <td>${row.gf}</td>
              <td>${row.gc}</td>

              <td>
                ${row.gd > 0 ? "+" : ""}
                ${row.gd}
              </td>

              <td>
                <strong>${row.points}</strong>
              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>

    </div>

  `;
}


// =====================================================
// DETALLE DE COMPETICIÓN
// =====================================================

function viewCompetition(id) {

  const competition =
    getCompetition(id);

  if (!competition) return;

  const results =
    data.matches
      .filter(
        m =>
          m.competitionId === id &&
          m.played
      )
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );


  const resultHTML =
    results.length === 0

      ? `<div class="empty">
          Todavía no hay resultados.
        </div>`

      : results.map(match => {

          const home =
            getTeam(match.homeId);

          const away =
            getTeam(match.awayId);

          return `

            <div class="round-match">

              <span>
                ${escapeHTML(home?.name || "Equipo")}
                <strong>
                  ${match.homeScore}
                  -
                  ${match.awayScore}
                </strong>
                ${escapeHTML(away?.name || "Equipo")}
              </span>

              <span class="date">
                ${match.date}
              </span>

            </div>

          `;

        }).join("");


  openModal(

    `${escapeHTML(competition.name)}`,

    `

      <div class="notice">

        ${escapeHTML(competition.type)}
        ·
        ${competition.teamIds.length}
        equipos

      </div>

      <h3>📊 Posiciones</h3>

      ${standingsHTML(id)}

      <h3 style="margin-top:25px;">
        ⚽ Resultados
      </h3>

      <div class="round">

        ${resultHTML}

      </div>

    `
  );
}


// =====================================================
// RENDER EQUIPOS
// =====================================================

function renderTeams() {

  const container =
    document.getElementById(
      "teamsGrid"
    );

  if (data.teams.length === 0) {

    container.innerHTML = `
      <div class="empty">
        No hay equipos todavía.
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.teams.map(team => {

      const players =
        data.players.filter(
          p => p.teamId === team.id
        ).length;

      return `

        <div class="team-card">

          <div class="team-top">

            <div class="team-logo">
              ⚽
            </div>

            <div class="rating">
              ${team.rating}/100
            </div>

          </div>

          <h3>
            ${escapeHTML(team.name)}
          </h3>

          <div class="card-muted">
            ${escapeHTML(team.shortName)}
            ·
            ${players} jugadores
          </div>

          <div class="card-actions">

            <button
              onclick="editTeam('${team.id}')"
            >
              Editar
            </button>

            <button
              onclick="deleteTeam('${team.id}')"
            >
              Eliminar
            </button>

          </div>

        </div>

      `;

    }).join("");
}


function editTeam(id) {

  const team =
    getTeam(id);

  if (!team) return;

  openModal(

    "Editar equipo",

    `

      <form onsubmit="saveTeamEdit(event, '${id}')">

        <div class="form-group">

          <label>Nombre</label>

          <input
            id="editTeamName"
            value="${escapeHTML(team.name)}"
            required
          >

        </div>

        <div class="form-group">

          <label>Nombre corto</label>

          <input
            id="editTeamShort"
            value="${escapeHTML(team.shortName)}"
            maxlength="5"
          >

        </div>

        <div class="form-group">

          <label>Fuerza: <span id="editRatingValue">
            ${team.rating}
          </span></label>

          <input
            id="editTeamRating"
            type="range"
            min="1"
            max="100"
            value="${team.rating}"
            oninput="document.getElementById('editRatingValue').textContent=this.value"
          >

        </div>

        <button class="primary-btn form-submit">
          Guardar
        </button>

      </form>

    `
  );
}


function saveTeamEdit(event, id) {

  event.preventDefault();

  const team =
    getTeam(id);

  if (!team) return;

  team.name =
    document.getElementById(
      "editTeamName"
    ).value.trim();

  team.shortName =
    document.getElementById(
      "editTeamShort"
    ).value.trim().toUpperCase();

  team.rating =
    Number(
      document.getElementById(
        "editTeamRating"
      ).value
    );

  saveData();

  closeModal();

  renderAll();
}


// =====================================================
// RENDER JUGADORES
// =====================================================

function renderPlayers() {

  const container =
    document.getElementById(
      "playersGrid"
    );

  if (data.players.length === 0) {

    container.innerHTML = `
      <div class="empty">
        No hay jugadores todavía.
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.players.map(player => {

      const team =
        getTeam(player.teamId);

      return `

        <div class="player-card">

          <div class="player-number">
            #${player.number}
          </div>

          <h3>
            ${escapeHTML(player.name)}
          </h3>

          <div class="card-muted">

            ${escapeHTML(player.position)}

            ·

            ${escapeHTML(
              team?.name || "Sin equipo"
            )}

          </div>

          <div class="card-actions">

            <button
              onclick="deletePlayer('${player.id}')"
            >
              Eliminar
            </button>

          </div>

        </div>

      `;

    }).join("");
}


// =====================================================
// RENDER COMPETICIONES
// =====================================================

function renderCompetitions() {

  const container =
    document.getElementById(
      "competitionsGrid"
    );

  if (data.competitions.length === 0) {

    container.innerHTML = `
      <div class="empty">
        No hay competiciones todavía.
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.competitions.map(comp => {

      const matches =
        data.matches.filter(
          m =>
            m.competitionId === comp.id
        );

      const played =
        matches.filter(
          m => m.played
        ).length;

      return `

        <div class="competition-card">

          <div class="team-top">

            <div class="team-logo">
              ${comp.type === "Liga" ? "🏆" : "🏅"}
            </div>

            <div class="rating">
              ${comp.type}
            </div>

          </div>

          <h3>
            ${escapeHTML(comp.name)}
          </h3>

          <div class="card-muted">

            ${comp.teamIds.length}
            equipos

            ·

            ${played}
            partidos jugados

          </div>

          <div class="card-actions">

            <button
              onclick="viewCompetition('${comp.id}')"
            >
              Ver tabla
            </button>

            <button
              onclick="openCompetitionModal('${comp.id}')"
            >
              Editar
            </button>

          </div>

          <div class="card-actions">

            <button
              onclick="openCalendarGenerator('${comp.id}')"
            >
              📅 Calendario
            </button>

            <button
              onclick="deleteCompetition('${comp.id}')"
            >
              Eliminar
            </button>

          </div>

        </div>

      `;

    }).join("");
}


// =====================================================
// GENERADOR DE CALENDARIOS UI
// =====================================================

function openCalendarGenerator(id) {

  const competition =
    getCompetition(id);

  if (!competition) return;

  openModal(

    "Generar calendario",

    `

      <div class="notice">

        🏆 ${escapeHTML(competition.name)}

        <br><br>

        Equipos:
        <strong>
          ${competition.teamIds.length}
        </strong>

      </div>

      <button
        class="primary-btn form-submit"
        onclick="generateCalendar('${id}', false); closeModal();"
      >
        📅 Generar ida
      </button>

      <button
        class="secondary-btn form-submit"
        onclick="generateCalendar('${id}', true); closeModal();"
      >
        🔄 Generar ida y vuelta
      </button>

      <button
        class="secondary-btn form-submit"
        onclick="randomizeCalendar('${id}'); closeModal();"
      >
        🎲 Calendario aleatorio
      </button>

      <p class="card-muted" style="margin-top:15px;">
        El calendario aleatorio mezcla el orden de los equipos
        antes de crear las jornadas.
      </p>

    `
  );
}


// =====================================================
// RENDER CALENDARIOS
// =====================================================

function renderCalendars() {

  const container =
    document.getElementById(
      "calendarContent"
    );

  if (data.competitions.length === 0) {

    container.innerHTML = `
      <div class="empty">
        Crea una competición para generar calendarios.
      </div>
    `;

    return;
  }


  container.innerHTML =
    data.competitions.map(comp => {

      const matches =
        data.matches.filter(
          m =>
            m.competitionId === comp.id &&
            m.round
        );

      if (!comp.calendarGenerated) {

        return `

          <div class="calendar-box">

            <div class="calendar-header">

              <div>

                <h3>
                  ${escapeHTML(comp.name)}
                </h3>

                <p class="card-muted">
                  ${comp.teamIds.length} equipos
                </p>

              </div>

              <button
                class="primary-btn"
                onclick="openCalendarGenerator('${comp.id}')"
              >
                🎲 Generar
              </button>

            </div>

            <div class="empty">
              Todavía no hay calendario.
            </div>

          </div>

        `;

      }


      const rounds =
        {};

      matches.forEach(match => {

        if (!rounds[match.round]) {
          rounds[match.round] = [];
        }

        rounds[match.round].push(match);

      });


      const roundsHTML =
        Object.keys(rounds)
          .sort((a, b) => Number(a) - Number(b))
          .map(roundNumber => {

            const roundMatches =
              rounds[roundNumber];

            return `

              <div class="round">

                <div class="round-title">

                  Jornada ${roundNumber}

                </div>

                ${roundMatches.map(match => {

                  const home =
                    getTeam(match.homeId);

                  const away =
                    getTeam(match.awayId);

                  return `

                    <div class="round-match">

                      <span>

                        ${escapeHTML(home?.name || "")}

                        <strong>

                          ${
                            match.played
                              ? ` ${match.homeScore} - ${match.awayScore} `
                              : " vs "
                          }

                        </strong>

                        ${escapeHTML(away?.name || "")}

                      </span>

                      <span>

                        ${
                          match.played

                            ? `<span class="date">
                                ${match.date}
                              </span>`

                            : `

                              <button
                                class="secondary-btn"
                                onclick="playCalendarMatch('${match.id}')"
                              >
                                🎲
                              </button>

                              <button
                                class="secondary-btn"
                                onclick="manualCalendarResult('${match.id}')"
                              >
                                ✍️
                              </button>

                            `
                        }

                      </span>

                    </div>

                  `;

                }).join("")}

              </div>

            `;

          }).join("");


      return `

        <div class="calendar-box">

          <div class="calendar-header">

            <div>

              <h3>
                ${escapeHTML(comp.name)}
              </h3>

              <p class="card-muted">
                ${comp.type}
                ·
                ${comp.teamIds.length}
                equipos
              </p>

            </div>

            <button
              class="secondary-btn"
              onclick="openCalendarGenerator('${comp.id}')"
            >
              ⚙️ Regenerar
            </button>

          </div>

          ${roundsHTML}

        </div>

      `;

    }).join("");
}


// =====================================================
// RENDER PARTIDOS
// =====================================================

function renderMatches() {

  const container =
    document.getElementById(
      "matchesList"
    );

  const matches =
    [...data.matches]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

  if (matches.length === 0) {

    container.innerHTML = `
      <div class="empty">
        No hay partidos todavía.
      </div>
    `;

    return;
  }


  container.innerHTML =
    matches.map(match => {

      const home =
        getTeam(match.homeId);

      const away =
        getTeam(match.awayId);

      const competition =
        getCompetition(
          match.competitionId
        );

      return `

        <div class="match-card">

          <div class="match-header">

            <span>
              ${escapeHTML(
                competition?.name || "Competición"
              )}
            </span>

            <span>
              ${match.date}
              ${match.time || ""}
            </span>

          </div>

          <div class="match-teams">

            <div class="match-team">

              ${escapeHTML(
                home?.name || "Equipo"
              )}

            </div>

            <div class="match-score">

              ${
                match.played
                  ? `${match.homeScore} - ${match.awayScore}`
                  : "VS"
              }

            </div>

            <div class="match-team">

              ${escapeHTML(
                away?.name || "Equipo"
              )}

            </div>

          </div>

          <div class="match-mode">

            ${
              match.played

                ? match.mode === "random"
                  ? "🎲 Resultado aleatorio"
                  : match.mode === "manual"
                    ? "✍️ Resultado manual"
                    : "📅 Calendario"

                : "⏳ Pendiente"
            }

          </div>

        </div>

      `;

    }).join("");
}


// =====================================================
// ESTADÍSTICAS
// =====================================================

function renderStats() {

  const container =
    document.getElementById(
      "statsContent"
    );

  if (data.competitions.length === 0) {

    container.innerHTML = `
      <div class="empty">
        No hay datos todavía.
      </div>
    `;

    return;
  }


  container.innerHTML =
    data.competitions.map(comp => {

      const standings =
        getStandings(comp.id);

      const top =
        standings[0];

      return `

        <div class="panel" style="margin-bottom:20px;">

          <div class="panel-header">

            <div>

              <h3>
                ${escapeHTML(comp.name)}
              </h3>

              <p>
                ${escapeHTML(comp.type)}
              </p>

            </div>

            <button
              class="secondary-btn"
              onclick="viewCompetition('${comp.id}')"
            >
              Ver tabla
            </button>

          </div>

          ${
            top

              ? `

                <div class="stats-grid">

                  <div class="stat-card">

                    <span>🥇</span>

                    <div>

                      <strong>
                        ${escapeHTML(top.name)}
                      </strong>

                      <small>
                        Líder · ${top.points} pts
                      </small>

                    </div>

                  </div>

                  <div class="stat-card">

                    <span>⚽</span>

                    <div>

                      <strong>
                        ${top.gf}
                      </strong>

                      <small>
                        Goles del líder
                      </small>

                    </div>

                  </div>

                </div>

              `

              : ""
          }

          ${standingsHTML(comp.id)}

        </div>

      `;

    }).join("");
}


// =====================================================
// INICIO
// =====================================================

function renderDashboard() {

  document.getElementById(
    "countTeams"
  ).textContent =
    data.teams.length;

  document.getElementById(
    "countPlayers"
  ).textContent =
    data.players.length;

  document.getElementById(
    "countCompetitions"
  ).textContent =
    data.competitions.length;

  document.getElementById(
    "countMatches"
  ).textContent =
    data.matches.filter(
      m => m.played
    ).length;


  const container =
    document.getElementById(
      "recentMatches"
    );

  const recent =
    [...data.matches]
      .filter(m => m.played)
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 5);


  if (recent.length === 0) {

    container.innerHTML =
      "No hay partidos todavía.";

    return;
  }


  container.innerHTML =
    recent.map(match => {

      const home =
        getTeam(match.homeId);

      const away =
        getTeam(match.awayId);

      return `

        <div class="round-match">

          <span>

            ${escapeHTML(home?.name || "")}

            <strong>
              ${match.homeScore}
              -
              ${match.awayScore}
            </strong>

            ${escapeHTML(away?.name || "")}

          </span>

          <span class="date">
            ${match.date}
          </span>

        </div>

      `;

    }).join("");
}


// =====================================================
// RENDER TODO
// =====================================================

function renderAll() {

  renderDashboard();

  renderTeams();

  renderPlayers();

  renderCompetitions();

  renderCalendars();

  renderMatches();

  renderStats();

}


// =====================================================
// INICIAR
// =====================================================

renderAll();
