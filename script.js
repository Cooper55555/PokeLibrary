document.addEventListener("DOMContentLoaded", () => {
  for (const [key, pokedex] of Object.entries(pokedexes)) {
    let regionBreaks;

    if (key === "dynamax") {
      regionBreaks = REGION_BREAKS_DYNAMAX;
    } else if (key === "gigantamax") {
      regionBreaks = REGION_BREAKS_GIGANTAMAX;
    } else if (key === "mega") {
      regionBreaks = REGION_BREAKS_MEGA;
    } else if (key === "shinygigantamax") {
      regionBreaks = REGION_BREAKS_SHINYGIGANTAMAX;
    } else if (key === "gofest") {
      regionBreaks = REGION_BREAKS_GOFEST;
    } else if (key === "shinydynamax") {
      regionBreaks = REGION_BREAKS_SHINYDYNAMAX;
    } else {
      regionBreaks = REGION_BREAKS_STANDARD;
    }

    insertRegionTitles(pokedex, regionBreaks);
    pokedex.regionBreaks = regionBreaks;  // <-- Add this line
  }

  // same for events
  for (const [key, pokedex] of Object.entries(events)) {
    let regionBreaks;

    if (key === "gofest") {
      regionBreaks = REGION_BREAKS_GOFEST;
    } else {
      regionBreaks = REGION_BREAKS_STANDARD;
    }

    insertRegionTitles(pokedex, regionBreaks);
    pokedex.regionBreaks = regionBreaks;  // <-- Add this here too
  }

  loadCaughtStatus();

  // New code: load last position
  const lastViewKey = localStorage.getItem("lastViewKey");
  const lastViewFilter = localStorage.getItem("lastViewFilter") || "all";

  if (lastViewKey && (pokedexes[lastViewKey] || medals[lastViewKey] || events[lastViewKey])) {
    renderPokedex(lastViewKey, lastViewFilter);
  } else {
    goHome();
  }
});

function insertRegionTitles(pokedex, regionBreaks) {
  const clonedData = [...pokedex.data];
  regionBreaks
    .filter(({ index }) => index <= clonedData.length)
    .slice()
    .reverse()
    .forEach(({ name, index }) => {
      clonedData.splice(index, 0, {
        name: `${name} Region`,
        number: "",
        img: "",
        isRegionTitle: true,
      });
    });
  pokedex.data = clonedData;
}

const currentFilter = {};
const currentSearch = {};
const selectedRegion = {};

function goHome() {

  localStorage.removeItem("lastViewKey");
  localStorage.removeItem("lastViewFilter");

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="settings-container">
      <i class="fas fa-cog settings-icon" onclick="toggleSettingsModal()"></i>
    </div>

    <div id="pokedexes-container">
      <h1>Pokemon Go Pokedexes</h1>
      <div id="pokedexes-section" class="collections">
        ${Object.entries(pokedexes).map(([key, dex]) => `
          <div class="collection-card" onclick="renderPokedex('${key}')">
            <div class="card-icon">📘</div>
            <div class="card-content">
              <h2>${dex.title}</h2>
              <p>${getCaughtCount(dex.data)} / ${dex.total} (${getPercentage(dex.data)}%)</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div id="medals-container">
      <h1>Pokemon Go Medals</h1>
      <div id="medals-section" class="collections">
        ${Object.entries(medals).map(([key, dex]) => `
          <div class="collection-card" onclick="renderPokedex('${key}')">
            <div class="card-icon">📘</div>
            <div class="card-content">
              <h2>${dex.title}</h2>
              <p>${getCaughtCount(dex.data)} / ${dex.total} (${getPercentage(dex.data)}%)</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div id="events-container">
      <h1>Pokemon Go Events</h1>
      <div id="events-section" class="collections">
        ${Object.entries(events).map(([key, dex]) => `
          <div class="collection-card" onclick="renderPokedex('${key}')">
            <div class="card-icon">📘</div>
            <div class="card-content">
              <h2>${dex.title}</h2>
              <p>${getCaughtCount(dex.data)} / ${dex.total} (${getPercentage(dex.data)}%)</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="copyright-container">
      <h5>© 2025 PokeLibrary. This website has been made by Cooper.</h5>
    </div>

    <div id="settings-modal" class="modal hidden">
      <div class="modal-content">
        <span class="close-button" onclick="toggleSettingsModal()">×</span>
        <h2>Settings</h2>

        <div class="switch-container">
          <label class="switch">
            <input type="checkbox" id="togglePokedexes" onchange="toggleSectionVisibility('pokedexes-container', this.checked)">
            <span class="slider"></span>
          </label>
          <span>Show Pokedexes</span>
        </div>

        <div class="switch-container">
          <label class="switch">
            <input type="checkbox" id="toggleMedals" onchange="toggleSectionVisibility('medals-container', this.checked)">
            <span class="slider"></span>
          </label>
          <span>Show Medals</span>
        </div>

        <div class="switch-container">
          <label class="switch">
            <input type="checkbox" id="toggleEvents" onchange="toggleSectionVisibility('events-container', this.checked)">
            <span class="slider"></span>
          </label>
          <span>Show Events</span>
        </div>

        <div class="switch-container">
          <label class="switch">
            <input type="checkbox" id="darkModeToggle" onchange="toggleDarkMode()">
            <span class="slider"></span>
          </label>
          <span>Dark Mode</span>
        </div>

        <div class="social-button-container">
          <a href="https://discord.gg/t5BGDzzSXg" target="_blank" class="social-button discord"><i class="fab fa-discord"></i></a>
          <a href="https://median.co/share/rrabnz#apk" target="_blank" class="social-button android"><i class="fab fa-android"></i></a>
        </div>
      </div>
    </div>
  `;

  syncToggleWithDarkMode();
  syncToggleSectionVisibility('pokedexes-container', 'togglePokedexes', true);
  syncToggleSectionVisibility('medals-container', 'toggleMedals', true);
  syncToggleSectionVisibility('events-container', 'toggleEvents', true);
}

function toggleSettingsModal() {
  const modal = document.getElementById("settings-modal");
  modal.classList.toggle("hidden");

  if (!modal.classList.contains("hidden")) {
    syncToggleWithDarkMode();
    syncToggleSectionVisibility('pokedexes-container', 'togglePokedexes', true);
    syncToggleSectionVisibility('medals-container', 'toggleMedals', true);
    syncToggleSectionVisibility('events-container', 'toggleEvents', true);
  }
}

function toggleDarkMode() {
  const toggle = document.getElementById("darkModeToggle");
  const isDarkMode = toggle.checked;
  document.body.classList.toggle("dark-mode", isDarkMode);
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
}

function syncToggleWithDarkMode() {
  const toggle = document.getElementById("darkModeToggle");
  const isDarkMode = localStorage.getItem("darkMode") === "enabled";
  if (toggle) {
    toggle.checked = isDarkMode;
  }
  document.body.classList.toggle("dark-mode", isDarkMode);
}

function toggleSectionVisibility(sectionId, isVisible) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = isVisible ? '' : 'none';
    localStorage.setItem(sectionId, isVisible ? 'visible' : 'hidden');
  }
}

function syncToggleSectionVisibility(sectionId, toggleId, defaultVisible) {
  const section = document.getElementById(sectionId);
  const toggle = document.getElementById(toggleId);
  const saved = localStorage.getItem(sectionId);
  const isVisible = saved === null ? defaultVisible : saved === 'visible';

  if (section && toggle) {
    section.style.display = isVisible ? '' : 'none';
    toggle.checked = isVisible;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
  }

  syncToggleSectionVisibility('pokedexes-section', 'togglePokedexes', true);
  syncToggleSectionVisibility('medals-section', 'toggleMedals', true);
  syncToggleSectionVisibility('events-section', 'toggleEvents', true);
});

function renderPokedex(key, filter = "all") {
  const pokedex = pokedexes[key] || medals[key] || events[key];
  if (!pokedex) {
    console.error(`Pokedex, Medal, or Event not found for key: ${key}`);
    return;
  }

  if (!selectedRegion[key]) {
  // Load from localStorage or initialize
  const savedRegions = localStorage.getItem(`selectedRegion_${key}`);
  if (savedRegions) {
    selectedRegion[key] = new Set(JSON.parse(savedRegions));
  } else {
    selectedRegion[key] = new Set();
  }

  // Apply caught status for saved selected regions
  const pokedex = pokedexes[key] || medals[key] || events[key];
  if (pokedex?.regionBreaks) {
    const breaks = pokedex.regionBreaks.slice().sort((a,b) => a.index - b.index);
    selectedRegion[key].forEach(idx => {
      const startIndex = breaks[idx].index;
      const endIndex = (idx + 1 < breaks.length) ? breaks[idx + 1].index - 1 : pokedex.data.length - 1;
      checkRegion(key, startIndex, endIndex);
    });
  }
}

  localStorage.setItem("lastViewKey", key);
  localStorage.setItem("lastViewFilter", filter);

  const app = document.getElementById("app");

  currentFilter[key] = filter;
  const searchTerm = currentSearch[key]?.toLowerCase() || "";

  const filteredList = pokedex.data.filter(p => {
    if (p.isRegionTitle) return true;
    const matchesFilter =
      filter === "have" ? p.caught :
      filter === "need" ? !p.caught :
      filter === "favorite" ? p.favorite :
      true;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm) || p.number.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  app.innerHTML = `
    <div class="top-bar">
      <button class="back-button" onclick="goHome()">← Back</button>
      <div class="settings-container">
      <i class="fas fa-cog settings-icon" onclick="toggleSecondSettingsModal()"></i>
      </div>
    </div>
    <h1>${pokedex.title}</h1>
    <h1 id="caught-counter">(${getCaughtCount(pokedex.data)} / ${pokedex.total})</h1>
    ${renderFilterControls(key, filter)}
    <div class="search-bar">
      <input id="search-${key}" type="text" placeholder="Search..." />
    </div>
    <div class="pokedex-grid">
      ${filteredList.map((pokemon, i) => {
        if (pokemon.isRegionTitle) {
          return `<div class="region-title">${pokemon.name}</div>`;
        }
        return `
          <div class="pokemon-card ${pokemon.caught ? 'caught' : ''}" onclick="toggleCaught('${key}', '${pokemon.number}', this)">
            <img src="${pokemon.img}" alt="${pokemon.name}" />
            <div>${pokemon.name}</div>
            <div>#${pokemon.number}</div>
            ${pokemon.caught ? `<div class="checkmark">✔️</div>` : ''}
            <div class="favorite-icon" onclick="event.stopPropagation(); toggleFavorite('${key}', '${pokemon.number}', this)">
              ${pokemon.favorite ? '🌝' : '🌚'}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div id="second-settings-modal" class="modal hidden second-modal">
      <div class="modal-content second-modal-content">
      <span class="close-button" onclick="toggleSecondSettingsModal()">×</span>
      <h2>Settings</h2>
      ${renderRegionButtons(key)}  <!-- Insert here -->
      <button class="download-button" onclick="downloadPDF('${key}')">Download PDF</button>
      </div>
    </div>
  `;

  if (!selectedRegion[key]) selectedRegion[key] = new Set();
  // Attach region button click listeners
const regionButtons = document.querySelectorAll(".region-button");
regionButtons.forEach(button => {
  button.addEventListener("click", () => {
    const idx = Number(button.dataset.index);
    const start = Number(button.dataset.start);
    const end = Number(button.dataset.end);

    if (!selectedRegion[key]) selectedRegion[key] = new Set();

    if (selectedRegion[key].has(idx)) {
      // Deselect region
      selectedRegion[key].delete(idx);
      uncheckRegion(key, start, end);
    } else {
      // Select region
      selectedRegion[key].add(idx);
      checkRegion(key, start, end);
    }

    // Save selected regions in localStorage
    localStorage.setItem(`selectedRegion_${key}`, JSON.stringify(Array.from(selectedRegion[key])));

    // Save whether the second modal is open before re-render
    const secondModal = document.getElementById('second-settings-modal');
    const wasModalOpen = !secondModal.classList.contains('hidden');

    renderPokedex(key, currentFilter[key]);

    // Re-open modal if it was open before
    if (wasModalOpen) {
      const newSecondModal = document.getElementById('second-settings-modal');
      if (newSecondModal) {
        newSecondModal.classList.remove('hidden');
      }
    }
  });
});

  const searchInput = document.getElementById(`search-${key}`);
  searchInput.value = currentSearch[key] || "";

  searchInput.addEventListener("input", (e) => {
    const input = e.target;
    const value = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    currentSearch[key] = value;
    renderPokedex(key, currentFilter[key]);

    const newInput = document.getElementById(`search-${key}`);
    newInput.focus();
    newInput.setSelectionRange(start, end);
  });
}

function toggleSecondSettingsModal() {
  const modal = document.getElementById('second-settings-modal');
  modal.classList.toggle('hidden');
}

function renderFilterControls(key, selected) {
  return `
    <div class="filter-bar">
      <button class="${selected === 'all' ? 'active' : ''}" onclick="renderPokedex('${key}', 'all')">All</button>
      <button class="${selected === 'have' ? 'active' : ''}" onclick="renderPokedex('${key}', 'have')">Have</button>
      <button class="${selected === 'need' ? 'active' : ''}" onclick="renderPokedex('${key}', 'need')">Need</button>
      <button class="${selected === 'favorite' ? 'active' : ''}" onclick="renderPokedex('${key}', 'favorite')">Favorite</button>
    </div>
  `;
}

function toggleCaught(key, id, cardElement) {
  const dex = pokedexes[key] || medals[key] || events[key];
  const pokemon = dex.data.find(p => p.number === id && !p.isRegionTitle);
  if (!pokemon) return;

  pokemon.caught = !pokemon.caught;
  saveCaughtStatus();

  cardElement.classList.toggle('caught');
  const checkmark = cardElement.querySelector(".checkmark");
  if (pokemon.caught && !checkmark) {
    cardElement.innerHTML += `<div class="checkmark">✔️</div>`;
  } else if (!pokemon.caught && checkmark) {
    checkmark.remove();
  }

  const counter = document.getElementById("caught-counter");
  counter.textContent = `(${getCaughtCount(dex.data)} / ${dex.total})`;
}

function toggleFavorite(key, id, iconElement) {
  const dex = pokedexes[key] || medals[key] || events[key];
  const pokemon = dex.data.find(p => p.number === id && !p.isRegionTitle);
  if (!pokemon) return;

  pokemon.favorite = !pokemon.favorite;
  iconElement.innerHTML = pokemon.favorite ? '🌝' : '🌚';
  saveCaughtStatus();
}

function getCaughtCount(pokemonList) {
  return pokemonList.filter(p => p.caught).length;
}

function getPercentage(pokemonList) {
  const total = pokemonList.filter(p => !p.isRegionTitle).length;
  const caught = getCaughtCount(pokemonList);
  return ((caught / total) * 100).toFixed(2);
}

function checkRegion(key, startIndex, endIndex) {
  const dex = pokedexes[key] || medals[key] || events[key];
  if (!dex) return;

  let realIndex = -1;
  for (let i = 0; i < dex.data.length; i++) {
    const p = dex.data[i];
    if (!p.isRegionTitle) {
      realIndex++;
      if (realIndex >= startIndex && realIndex <= endIndex) {
        p.caught = true;
      }
    }
  }

  saveCaughtStatus();
}

function uncheckRegion(key, startIndex, endIndex) {
  const dex = pokedexes[key] || medals[key] || events[key];
  if (!dex) return;

  let realIndex = -1;
  for (let i = 0; i < dex.data.length; i++) {
    const p = dex.data[i];
    if (!p.isRegionTitle) {
      realIndex++;
      if (realIndex >= startIndex && realIndex <= endIndex) {
        p.caught = false;
      }
    }
  }

  saveCaughtStatus();
}

function renderRegionButtons(key) {
  const pokedex = pokedexes[key] || medals[key] || events[key];
  if (!pokedex?.regionBreaks) return '';

  const breaks = pokedex.regionBreaks.slice().sort((a,b) => a.index - b.index);

  return `
    <div class="region-buttons-container" style="margin-bottom: 20px;">
      ${breaks.map(({ name, index }, i) => {
        const endIndex = (i + 1 < breaks.length) ? breaks[i+1].index - 1 : pokedex.data.length - 1;
        const isSelected = selectedRegion[key]?.has(i);
        return `<button class="region-button ${isSelected ? 'selected' : ''}" 
                data-index="${i}"
                data-start="${index}"
                data-end="${endIndex}"
                style="padding: 0.5rem 1rem; cursor: pointer;">
                ${name}
              </button>`;
      }).join('')}
    </div>
  `;
}

const STORAGE_KEY = "pokemonCaughtStatus";

function saveCaughtStatus() {
  const status = {};

  for (const [dexKey, dex] of Object.entries({ ...pokedexes, ...events })) {
    status[dexKey] = {};
    dex.data.forEach(p => {
      if (!p.isRegionTitle) {
        status[dexKey][p.number] = {
          caught: !!p.caught,
          favorite: !!p.favorite
        };
      }
    });
  }

  for (const [medalKey, dex] of Object.entries(medals)) {
    status[medalKey] = {};
    dex.data.forEach((p, i) => {
      if (!p.isRegionTitle) {
        const uniqueKey = `${medalKey}_${i}`;
        status[medalKey][uniqueKey] = {
          caught: !!p.caught,
          favorite: !!p.favorite
        };
      }
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
}


function loadCaughtStatus() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const status = JSON.parse(saved);

  for (const [dexKey, savedMap] of Object.entries(status)) {
    const dex = pokedexes[dexKey] || medals[dexKey] || events[dexKey];
    if (!dex) continue;

    dex.data.forEach((p, i) => {
      if (!p.isRegionTitle) {
        if (medals[dexKey]) {
          const uniqueKey = `${dexKey}_${i}`;
          const savedObj = savedMap[uniqueKey];
          if (savedObj) {
            p.caught = savedObj.caught ?? false;
            p.favorite = savedObj.favorite ?? false;
          }
        } else {
          const savedObj = savedMap[p.number];
          if (savedObj) {
            p.caught = savedObj.caught ?? false;
            p.favorite = savedObj.favorite ?? false;
          }
        }
      }
    });
  }
}

const REGION_BREAKS_STANDARD = [
  { name: "Kanto", index: 0 },
  { name: "Johto", index: 151 },
  { name: "Hoenn", index: 251 },
  { name: "Sinnoh", index: 386 },
  { name: "Unova", index: 493 },
  { name: "Kalos", index: 649 },
  { name: "Alola", index: 721 },
  { name: "Galar", index: 807 },
  { name: "Hisui", index: 896 },
  { name: "Paldea", index: 903 },
  { name: "Unidentified", index: 1004 },
];

const REGION_BREAKS_GOFEST = [
  { name: "Research", index: 0 },
  { name: "Raid", index: 1 },
  { name: "Moonless Volcano", index: 8 },
  { name: "Galvanic Dojo", index: 18 },
  { name: "Hypnotic Tundra", index: 28 },
  { name: "Fae Swamp", index: 38 },
  { name: "Day-Long Saturday", index: 48 },
  { name: "Day-Long Sunday", index: 56 },
  { name: "Incense-Exclusive Spawns", index: 64 },
  { name: "Incense-Saturday Unown", index: 68 },
  { name: "Incense-Sunday Unown", index: 74 },
];

const REGION_BREAKS_DYNAMAX = [
  { name: "Kanto", index: 0 },
  { name: "Johto", index: 24 },
  { name: "Hoenn", index: 29 },
  { name: "Unova", index: 33 },
  { name: "Alola", index: 41 },
  { name: "Galar", index: 42 },
];

const REGION_BREAKS_SHINYDYNAMAX = [...REGION_BREAKS_DYNAMAX];
const REGION_BREAKS_GIGANTAMAX = [
  { name: "Kanto", index: 0 },
  { name: "Galar", index: 8 },
];
const REGION_BREAKS_SHINYGIGANTAMAX = [...REGION_BREAKS_GIGANTAMAX];
const REGION_BREAKS_MEGA = [
  { name: "Kanto", index: 0 },
  { name: "Johto", index: 13 },
  { name: "Hoenn", index: 19 },
  { name: "Sinnoh", index: 35 },
  { name: "Kalos", index: 38 },
];

function downloadPDF(key) {
  const pokedex = pokedexes[key] || medals[key] || events[key];
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(16);
  doc.text(`${pokedex.title} Collection`, 10, y);
  y += 10;

  pokedex.data.forEach(p => {
    if (p.isRegionTitle) {
      doc.setFontSize(14);
      doc.text(p.name, 10, y);
      y += 8;
    } else {
      let line = `#${p.number} ${p.name}`;
      const tags = [];
      if (p.caught) tags.push("[Caught]");
      if (p.favorite) tags.push("[Favorite]");
      if (tags.length) line += ` ${tags.join(" ")}`;

      doc.setFontSize(12);
      doc.text(line, 10, y);
      y += 6;
    }

    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save(`${pokedex.title}.pdf`);
}