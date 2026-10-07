const STORAGE_KEY = "football_manager_data";

let data = loadData();

function createId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(error);
  }

  return {
    teams: [],
    players: [],
    leagues: [],
    tournaments: [],
    matches: []
  };
}

function saveData() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  updateDashboard();
  renderAll();
}

function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]
  );
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active");
  });

  const target = document.getElementById(
    `page-${page}`
  );

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".side-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });

  document.getElementById("sidebar")
    .classList.remove("open");
}

document.querySelectorAll(".side-btn").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-open]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.open);
  });
});

document.getElementById("menuButton").addEventListener(
  "click",
  () => {
    document
      .getElementById("sidebar")
      .classList.toggle("open");
  }
);

function openModal(content) {
  document.getElementById("modalContent").innerHTML =
    content;

  document
    .getElementById("modal")
    .classList.remove("hidden");
}

function closeModal() {
  document
    .getElementById("modal")
    .classList.add("hidden");
}

document.getElementById("closeModal").addEventListener(
  "click",
  closeModal
);

document.getElementById("modalBackdrop").addEventListener(
  "click",
  closeModal
);

function updateDashboard() {
  document.getElementById("dashboardTeams").textContent =
    data.teams.length;

  document.getElementById("dashboardPlayers").textContent =
    data.players.length;

  document.getElementById("dashboardLeagues").textContent =
    data.leagues.length;

  document.getElementById("dashboardTournaments").textContent =
    data.tournaments.length;

  document.getElementById("dashboardMatches").textContent =
    data.matches.length;
}


// ============================
// EQUIPOS
// ============================

document.getElementById("newTeam").addEventListener(
  "click",
  () => {

    openModal(`
      <h2>Crear equipo</h2>

      <form id="teamForm">

        <div class="form-group">
          <label>Nombre del equipo</label>

          <input
            id="teamName"
            required
            placeholder="Ej: Real Madrid"
          >
        </div>

        <div class="form-group">
          <label>Nombre corto</label>

          <input
            id="teamShort"
            maxlength="5"
            placeholder="Ej: RMA"
          >
        </div>

        <div class="form-group">
          <label>Escudo</label>

          <input
            id="teamLogo"
            placeholder="Emoji o URL de imagen"
          >
        </div>

        <div class="form-group">
          <label>Color principal</label>

          <input
            id="teamColor"
            type="color"
            value="#ffffff"
          >
        </div>

        <div class="form-group">
          <label>País</label>

          <input
            id="teamCountry"
            placeholder="Ej: España"
          >
        </div>

        <div class="form-group">
          <label>Estadio</label>

          <input
            id="teamStadium"
            placeholder="Ej: Santiago Bernabéu"
          >
        </div>

        <div class="form-actions">

          <button
            type="button"
            class="cancel-btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="primary-btn"
          >
            Crear equipo
          </button>

        </div>

      </form>
    `);

    document.getElementById("teamForm").addEventListener(
      "submit",
      event => {

        event.preventDefault();

        data.teams.push({
          id: createId(),
          name: document.getElementById("teamName").value.trim(),
          short: document.getElementById("teamShort").value.trim(),
          logo: document.getElementById("teamLogo").value.trim(),
          color: document.getElementById("teamColor").value,
          country: document.getElementById("teamCountry").value.trim(),
          stadium: document.getElementById("teamStadium").value.trim()
        });

        saveData();

        closeModal();

      }
    );
  }
);


function renderTeams() {

  const container =
    document.getElementById("teamsList");

  if (!data.teams.length) {

    container.innerHTML = `
      <div class="empty">
        <h3>No tienes equipos</h3>
        <p>Crea tu primer equipo personalizado.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.teams.map(team => {

      const logo =
        team.logo?.startsWith("http")

          ? `
            <img
              src="${escapeHTML(team.logo)}"
              alt=""
            >
          `

          : escapeHTML(
              team.logo || "⚽"
            );

      return `
        <div class="card">

          <div class="team-card-header">

            <div class="team-logo-big">
              ${logo}
            </div>

            <div>

              <h3>
                ${escapeHTML(team.name)}
              </h3>

              <p>
                ${escapeHTML(team.short || "Sin abreviatura")}
              </p>

            </div>

          </div>

          <p>
            🌎 ${escapeHTML(team.country || "Sin país")}
          </p>

          <p>
            🏟️ ${escapeHTML(team.stadium || "Sin estadio")}
          </p>

          <div class="card-actions">

            <button
              class="small-btn danger"
              onclick="deleteTeam('${team.id}')"
            >
              Eliminar
            </button>

          </div>

        </div>
      `;
    }).join("");
}

window.deleteTeam = function(id) {

  const team =
    data.teams.find(t => t.id === id);

  if (!team) return;

  if (
    !confirm(
      `¿Eliminar el equipo ${team.name}?`
    )
  ) {
    return;
  }

  data.teams =
    data.teams.filter(
      t => t.id !== id
    );

  data.players =
    data.players.filter(
      p => p.teamId !== id
    );

  saveData();
};


// ============================
// JUGADORES
// ============================

document.getElementById("newPlayer").addEventListener(
  "click",
  () => {

    if (!data.teams.length) {

      alert(
        "Primero debes crear un equipo."
      );

      return;
    }

    openModal(`
      <h2>Crear jugador</h2>

      <form id="playerForm">

        <div class="form-group">
          <label>Nombre</label>

          <input
            id="playerName"
            required
            placeholder="Ej: Juan Pérez"
          >
        </div>

        <div class="form-group">
          <label>Número</label>

          <input
            id="playerNumber"
            type="number"
            min="1"
            max="99"
            placeholder="10"
          >
        </div>

        <div class="form-group">
          <label>Posición</label>

          <select id="playerPosition">

            <option>Portero</option>
            <option>Defensa</option>
            <option>Mediocampista</option>
            <option>Extremo</option>
            <option>Delantero</option>

          </select>
        </div>

        <div class="form-group">
          <label>Equipo</label>

          <select id="playerTeam">

            ${data.teams.map(team => `
              <option value="${team.id}">
                ${escapeHTML(team.name)}
              </option>
            `).join("")}

          </select>

        </div>

        <div class="form-actions">

          <button
            type="button"
            class="cancel-btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="primary-btn"
          >
            Crear jugador
          </button>

        </div>

      </form>
    `);

    document.getElementById("playerForm").addEventListener(
      "submit",
      event => {

        event.preventDefault();

        data.players.push({
          id: createId(),
          name: document.getElementById("playerName").value.trim(),
          number: document.getElementById("playerNumber").value,
          position: document.getElementById("playerPosition").value,
          teamId: document.getElementById("playerTeam").value,
          goals: 0,
          assists: 0,
          yellow: 0,
          red: 0
        });

        saveData();

        closeModal();

      }
    );
  }
);


function renderPlayers() {

  const container =
    document.getElementById("playersList");

  if (!data.players.length) {

    container.innerHTML = `
      <div class="empty">
        <h3>No tienes jugadores</h3>
        <p>Crea jugadores para tus equipos.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.players.map(player => {

      const team =
        data.teams.find(
          t => t.id === player.teamId
        );

      return `
        <div class="card">

          <div class="team-card-header">

            <div class="player-number">
              ${escapeHTML(player.number || "?")}
            </div>

            <div>

              <h3>
                ${escapeHTML(player.name)}
              </h3>

              <p>
                ${escapeHTML(player.position)}
              </p>

            </div>

          </div>

          <p>
            ⚽ ${escapeHTML(team?.name || "Sin equipo")}
          </p>

          <p>
            🥅 ${player.goals} goles
          </p>

          <p>
            🟨 ${player.yellow}
            &nbsp;
            🟥 ${player.red}
          </p>

          <div class="card-actions">

            <button
              class="small-btn danger"
              onclick="deletePlayer('${player.id}')"
            >
              Eliminar
            </button>

          </div>

        </div>
      `;
    }).join("");
}

window.deletePlayer = function(id) {

  data.players =
    data.players.filter(
      p => p.id !== id
    );

  saveData();
};


// ============================
// LIGAS
// ============================

document.getElementById("newLeague").addEventListener(
  "click",
  () => {

    openModal(`
      <h2>Crear liga</h2>

      <form id="leagueForm">

        <div class="form-group">

          <label>
            Nombre de la liga
          </label>

          <input
            id="leagueName"
            required
            placeholder="Ej: Liga Nacional"
          >

        </div>


        <div class="form-group">

          <label>
            País
          </label>

          <input
            id="leagueCountry"
            placeholder="Ej: España"
          >

        </div>


        <div class="form-group">

          <label>
            Descripción
          </label>

          <textarea
            id="leagueDescription"
            placeholder="Descripción de la competición..."
          ></textarea>

        </div>


        <div class="form-actions">

          <button
            type="button"
            class="cancel-btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="primary-btn"
          >
            Crear liga
          </button>

        </div>

      </form>
    `);

    document.getElementById("leagueForm").addEventListener(
      "submit",
      event => {

        event.preventDefault();

        data.leagues.push({
          id: createId(),
          name: document.getElementById("leagueName").value.trim(),
          country: document.getElementById("leagueCountry").value.trim(),
          description: document.getElementById("leagueDescription").value.trim(),
          teams: []
        });

        saveData();

        closeModal();

      }
    );
  }
);


function renderLeagues() {

  const container =
    document.getElementById("leaguesList");

  if (!data.leagues.length) {

    container.innerHTML = `
      <div class="empty">
        <h3>No tienes ligas</h3>
        <p>Crea tu primera liga.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.leagues.map(league => {

      return `
        <div class="card">

          <h3>
            🏆 ${escapeHTML(league.name)}
          </h3>

          <p>
            🌎 ${escapeHTML(league.country || "Sin país")}
          </p>

          <p>
            ${escapeHTML(
              league.description ||
              "Sin descripción"
            )}
          </p>

          <p>
            ⚽ ${league.teams.length} equipos
          </p>

          <div class="card-actions">

            <button
              class="small-btn"
              onclick="manageLeague('${league.id}')"
            >
              Administrar
            </button>

            <button
              class="small-btn danger"
              onclick="deleteLeague('${league.id}')"
            >
              Eliminar
            </button>

          </div>

        </div>
      `;
    }).join("");
}

window.deleteLeague = function(id) {

  data.leagues =
    data.leagues.filter(
      l => l.id !== id
    );

  saveData();
};

window.manageLeague = function(id) {

  const league =
    data.leagues.find(
      l => l.id === id
    );

  if (!league) return;

  openModal(`
    <h2>
      ${escapeHTML(league.name)}
    </h2>

    <p>
      Selecciona los equipos participantes.
    </p>

    <form id="leagueTeamsForm">

      ${
        data.teams.length

          ? data.teams.map(team => `
              <div class="form-group">

                <label>

                  <input
                    type="checkbox"
                    value="${team.id}"
                    ${
                      league.teams.includes(team.id)
                        ? "checked"
                        : ""
                    }
                  >

                  ${escapeHTML(team.name)}

                </label>

              </div>
            `).join("")

          : `
            <p>
              Primero crea equipos.
            </p>
          `
      }

      <div class="form-actions">

        <button
          type="submit"
          class="primary-btn"
        >
          Guardar equipos
        </button>

      </div>

    </form>
  `);

  document
    .getElementById("leagueTeamsForm")
    .addEventListener(
      "submit",
      event => {

        event.preventDefault();

        league.teams =
          [...event.target.querySelectorAll(
            "input[type=checkbox]:checked"
          )].map(
            input => input.value
          );

        saveData();

        closeModal();

      }
    );
};


// ============================
// TORNEOS
// ============================

document.getElementById("newTournament").addEventListener(
  "click",
  () => {

    openModal(`
      <h2>Crear torneo</h2>

      <form id="tournamentForm">

        <div class="form-group">

          <label>
            Nombre del torneo
          </label>

          <input
            id="tournamentName"
            required
            placeholder="Ej: Copa Mundial"
          >

        </div>


        <div class="form-group">

          <label>
            Formato
          </label>

          <select id="tournamentFormat">

            <option value="elimination">
              Eliminación directa
            </option>

            <option value="groups">
              Fase de grupos
            </option>

          </select>

        </div>


        <div class="form-group">

          <label>
            Descripción
          </label>

          <textarea
            id="tournamentDescription"
          ></textarea>

        </div>


        <div class="form-actions">

          <button
            type="button"
            class="cancel-btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="primary-btn"
          >
            Crear torneo
          </button>

        </div>

      </form>
    `);

    document.getElementById("tournamentForm").addEventListener(
      "submit",
      event => {

        event.preventDefault();

        data.tournaments.push({
          id: createId(),
          name: document.getElementById("tournamentName").value.trim(),
          format: document.getElementById("tournamentFormat").value,
          description: document.getElementById("tournamentDescription").value.trim(),
          teams: []
        });

        saveData();

        closeModal();

      }
    );
  }
);


function renderTournaments() {

  const container =
    document.getElementById("tournamentsList");

  if (!data.tournaments.length) {

    container.innerHTML = `
      <div class="empty">
        <h3>No tienes torneos</h3>
        <p>Crea tu primer torneo.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.tournaments.map(tournament => {

      const format =
        tournament.format === "groups"
          ? "Fase de grupos"
          : "Eliminación directa";

      return `
        <div class="card">

          <h3>
            🏆 ${escapeHTML(tournament.name)}
          </h3>

          <p>
            ${format}
          </p>

          <p>
            ${escapeHTML(
              tournament.description ||
              "Sin descripción"
            )}
          </p>

          <p>
            ⚽ ${tournament.teams.length} equipos
          </p>

          <div class="card-actions">

            <button
              class="small-btn"
              onclick="manageTournament('${tournament.id}')"
            >
              Administrar
            </button>

            <button
              class="small-btn danger"
              onclick="deleteTournament('${tournament.id}')"
            >
              Eliminar
            </button>

          </div>

        </div>
      `;
    }).join("");
}

window.deleteTournament = function(id) {

  data.tournaments =
    data.tournaments.filter(
      t => t.id !== id
    );

  saveData();
};

window.manageTournament = function(id) {

  const tournament =
    data.tournaments.find(
      t => t.id === id
    );

  if (!tournament) return;

  openModal(`
    <h2>
      ${escapeHTML(tournament.name)}
    </h2>

    <p>
      Selecciona los equipos participantes.
    </p>

    <form id="tournamentTeamsForm">

      ${
        data.teams.length

          ? data.teams.map(team => `
              <div class="form-group">

                <label>

                  <input
                    type="checkbox"
                    value="${team.id}"
                    ${
                      tournament.teams.includes(team.id)
                        ? "checked"
                        : ""
                    }
                  >

                  ${escapeHTML(team.name)}

                </label>

              </div>
            `).join("")

          : `
            <p>
              Primero crea equipos.
            </p>
          `
      }

      <div class="form-actions">

        <button
          type="submit"
          class="primary-btn"
        >
          Guardar equipos
        </button>

      </div>

    </form>
  `);

  document
    .getElementById("tournamentTeamsForm")
    .addEventListener(
      "submit",
      event => {

        event.preventDefault();

        tournament.teams =
          [...event.target.querySelectorAll(
            "input[type=checkbox]:checked"
          )].map(
            input => input.value
          );

        saveData();

        closeModal();

      }
    );
};


// ============================
// PARTIDOS
// ============================

document.getElementById("newMatch").addEventListener(
  "click",
  () => {

    if (data.teams.length < 2) {

      alert(
        "Necesitas al menos 2 equipos."
      );

      return;
    }

    openModal(`
      <h2>Crear partido</h2>

      <form id="matchForm">

        <div class="form-group">

          <label>
            Equipo local
          </label>

          <select id="homeTeam">

            ${data.teams.map(team => `
              <option value="${team.id}">
                ${escapeHTML(team.name)}
              </option>
            `).join("")}

          </select>

        </div>


        <div class="form-group">

          <label>
            Equipo visitante
          </label>

          <select id="awayTeam">

            ${data.teams.map(team => `
              <option value="${team.id}">
                ${escapeHTML(team.name)}
              </option>
            `).join("")}

          </select>

        </div>


        <div class="form-group">

          <label>
            Competición
          </label>

          <input
            id="matchCompetition"
            placeholder="Ej: Liga Nacional"
          >

        </div>


        <div class="form-group">

          <label>
            Fecha
          </label>

          <input
            id="matchDate"
            type="date"
            required
          >

        </div>


        <div class="form-group">

          <label>
            Hora
          </label>

          <input
            id="matchTime"
            type="time"
          >

        </div>


        <div class="form-actions">

          <button
            type="button"
            class="cancel-btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="primary-btn"
          >
            Crear partido
          </button>

        </div>

      </form>
    `);

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    document.getElementById("matchDate").value =
      today;

    document.getElementById("matchForm").addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const home =
          document.getElementById("homeTeam").value;

        const away =
          document.getElementById("awayTeam").value;

        if (home === away) {

          alert(
            "Los equipos deben ser diferentes."
          );

          return;
        }

        data.matches.push({
          id: createId(),

          homeId: home,

          awayId: away,

          competition:
            document
              .getElementById("matchCompetition")
              .value
              .trim(),

          date:
            document
              .getElementById("matchDate")
              .value,

          time:
            document
              .getElementById("matchTime")
              .value,

          homeScore: null,

          awayScore: null,

          status: "scheduled",

          goals: [],

          cards: []
        });

        saveData();

        closeModal();

      }
    );
  }
);


function renderMatches() {

  const container =
    document.getElementById("matchesList");

  if (!data.matches.length) {

    container.innerHTML = `
      <div class="empty">
        <h3>No tienes partidos</h3>
        <p>Crea tu primer partido.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.matches.map(match => {

      const home =
        data.teams.find(
          t => t.id === match.homeId
        );

      const away =
        data.teams.find(
          t => t.id === match.awayId
        );

      if (!home || !away) {
        return "";
      }

      const score =
        match.status === "finished"

          ? `${match.homeScore} - ${match.awayScore}`

          : "vs";

      return `
        <div class="match-card">

          <div class="match-info">

            ${escapeHTML(
              match.competition ||
              "Partido"
            )}

            ·

            ${escapeHTML(match.date)}

            ${
              match.time
                ? ` · ${escapeHTML(match.time)}`
                : ""
            }

          </div>


          <div class="match-teams">

            <div class="match-team">

              <span>
                ${escapeHTML(
                  home.logo || "⚽"
                )}
              </span>

              ${escapeHTML(home.name)}

            </div>


            <div class="match-score">

              ${score}

            </div>


            <div class="match-team away">

              ${escapeHTML(away.name)}

              <span>
                ${escapeHTML(
                  away.logo || "⚽"
                )}
              </span>

            </div>

          </div>


          <div class="match-actions">

            ${
              match.status !== "finished"

                ? `
                  <button
                    class="small-btn"
                    onclick="resultMatch('${match.id}')"
                  >
                    Registrar resultado
                  </button>
                `

                : `
                  <span
                    style="color:#65dc92;padding:8px"
                  >
                    FINALIZADO
                  </span>
                `
            }


            <button
              class="small-btn danger"
              onclick="deleteMatch('${match.id}')"
            >
              Eliminar
            </button>

          </div>

        </div>
      `;
    }).join("");
}

window.deleteMatch = function(id) {

  data.matches =
    data.matches.filter(
      m => m.id !== id
    );

  saveData();
};


window.resultMatch = function(id) {

  const match =
    data.matches.find(
      m => m.id === id
    );

  if (!match) return;

  const home =
    data.teams.find(
      t => t.id === match.homeId
    );

  const away =
    data.teams.find(
      t => t.id === match.awayId
    );

  openModal(`
    <h2>
      Registrar resultado
    </h2>

    <p>
      ${escapeHTML(home.name)}
      vs
      ${escapeHTML(away.name)}
    </p>


    <form id="resultForm">

      <div class="form-group">

        <label>
          Goles de ${escapeHTML(home.name)}
        </label>

        <input
          id="homeScore"
          type="number"
          min="0"
          value="0"
          required
        >

      </div>


      <div class="form-group">

        <label>
          Goles de ${escapeHTML(away.name)}
        </label>

        <input
          id="awayScore"
          type="number"
          min="0"
          value="0"
          required
        >

      </div>


      <div class="form-actions">

        <button
          type="button"
          class="cancel-btn"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="primary-btn"
        >
          Guardar resultado
        </button>

      </div>

    </form>
  `);

  document.getElementById("resultForm").addEventListener(
    "submit",
    event => {

      event.preventDefault();

      match.homeScore =
        Number(
          document.getElementById(
            "homeScore"
          ).value
        );

      match.awayScore =
        Number(
          document.getElementById(
            "awayScore"
          ).value
        );

      match.status =
        "finished";

      updatePlayerStats(
        match
      );

      saveData();

      closeModal();

    }
  );
};


function updatePlayerStats(match) {

  // Esta función prepara las estadísticas
  // generales del partido.

  // Los goleadores detallados se podrán
  // registrar posteriormente.

}


// ============================
// ESTADÍSTICAS
// ============================

function renderStats() {

  const scorers =
    [...data.players]
      .sort(
        (a, b) =>
          b.goals - a.goals
      );

  const scorerContainer =
    document.getElementById(
      "topScorers"
    );

  if (!scorers.length) {

    scorerContainer.innerHTML = `
      <div class="empty">
        Todavía no hay jugadores.
      </div>
    `;

  } else {

    scorerContainer.innerHTML =
      scorers
        .slice(0, 10)
        .map(
          (player, index) => `

            <div class="stat-row">

              <span>
                ${index + 1}.
                ${escapeHTML(player.name)}
              </span>

              <strong>
                ⚽ ${player.goals}
              </strong>

            </div>

          `
        )
        .join("");

  }


  const teamStats =
    data.teams.map(team => {

      const matches =
        data.matches.filter(
          match =>
            match.status === "finished" &&
            (
              match.homeId === team.id ||
              match.awayId === team.id
            )
        );

      let wins = 0;
      let draws = 0;
      let losses = 0;

      let goalsFor = 0;
      let goalsAgainst = 0;

      matches.forEach(match => {

        const isHome =
          match.homeId === team.id;

        const gf =
          isHome
            ? match.homeScore
            : match.awayScore;

        const ga =
          isHome
            ? match.awayScore
            : match.homeScore;

        goalsFor += gf;
        goalsAgainst += ga;

        if (gf > ga) wins++;
        else if (gf === ga) draws++;
        else losses++;

      });

      return {
        team,
        matches: matches.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst
      };

    });


  const teamContainer =
    document.getElementById(
      "teamStats"
    );


  if (!teamStats.length) {

    teamContainer.innerHTML = `
      <div class="empty">
        Todavía no hay equipos.
      </div>
    `;

  } else {

    teamContainer.innerHTML =
      teamStats
        .map(
          stat => `

            <div class="stat-row">

              <span>
                ⚽
                ${escapeHTML(
                  stat.team.name
                )}
              </span>

              <strong>
                PJ ${stat.matches}
                ·
                G ${stat.wins}
                ·
                E ${stat.draws}
                ·
                P ${stat.losses}
              </strong>

            </div>

          `
        )
        .join("");

  }

}


// ============================
// RENDER
// ============================

function renderAll() {

  renderTeams();

  renderPlayers();

  renderLeagues();

  renderTournaments();

  renderMatches();

  renderStats();

}

updateDashboard();

renderAll();
