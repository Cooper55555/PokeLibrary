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
  loadTCGSets();
  loadCardSets();  // Load saved card states

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

  // Navbar HTML
  const navbarHTML = `
    <nav id="main-navbar" class="navbar">
      <div class="navbar-logo">PokeLibrary</div>
      <div class="navbar-links">
        <button class="nav-btn active" data-section="pogo-section">POGO</button>
        <button class="nav-btn" data-section="tcg-section">TCG</button>
        <button class="nav-btn" data-section="cards-section">CARDS</button>
      </div>
    </nav>
  `;

  // POGO Section with your existing content
  const pogoHTML = `
    <div id="pogo-section" class="section active">
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
              <div class="card-icon">📗</div>
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
              <div class="card-icon">📕</div>
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
              <input type="checkbox" class="dark-mode-toggle" onchange="toggleDarkMode()">
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
    </div>
  `;

  // Placeholder TCG Section
const tcgHTML = `
  <div id="tcg-section" class="section" style="display:none;">
      <div class="settings-container">
        <i class="fas fa-cog settings-icon" onclick="toggleTCGSettingsModal()"></i>
      </div>
    <h1>TCG Pocket Sets</h1>
    <div id="tcg-sets-section" class="collections">
      ${Object.entries(tcgSets).map(([key, set]) => `
        <div class="collection-card" onclick="renderTCGSet('${key}')">
          <div class="card-icon">📔</div>
          <div class="card-content">
            <h2>${set.title}</h2>
            <p>${getCaughtCount(set.data)} / ${set.total} (${getPercentage(set.data)}%)</p>
          </div>
        </div>
      `).join('')}
    </div>
      <div class="copyright-container">
        <h5>© 2025 PokeLibrary. This website has been made by Cooper.</h5>
      </div>
  </div>

        <div id="settings-modal-tcg" class="modal hidden">
        <div class="modal-content">
          <span class="close-button" onclick="toggleTCGSettingsModal()">×</span>
          <h2>Settings</h2>

          <div class="switch-container">
  <label class="switch">
    <input type="checkbox" class="dark-mode-toggle" onchange="toggleDarkMode()">
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
    </div>
`;

  // Cards Section
  const cardsHTML = `
<div id="cards-section" class="section" style="display:none;">
  <div class="settings-container">
    <i class="fas fa-cog settings-icon" onclick="toggleCardHomeSettingsModal()"></i>
  </div>
  <h1>Pokemon Card Sets</h1>
  <div id="card-sets-section" class="collections">
    ${Object.entries(cardSets).map(([key, set]) => `
      <div class="collection-card" onclick="renderCardSet('${key}')">
        <div class="card-icon">📒</div>
        <div class="card-content">
          <h2>${set.title}</h2>
          <p>${getCaughtCount(set.data)} / ${set.total} (${getPercentage(set.data)}%)</p>
        </div>
      </div>
    `).join("")}
  </div>

  <div class="copyright-container">
    <h5>© 2025 PokeLibrary. This website has been made by Cooper.</h5>
  </div>

<div id="card-home-settings-modal" class="modal hidden">
  <div class="modal-content">
    <span class="close-button" onclick="toggleCardHomeSettingsModal()">×</span>
    <h2>Settings</h2>
          <div class="switch-container">
  <label class="switch">
    <input type="checkbox" class="dark-mode-toggle" onchange="toggleDarkMode()">
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
</div>
  `;

  // Inject content
  app.innerHTML = navbarHTML + pogoHTML + tcgHTML + cardsHTML;

  // Sync toggles and dark mode
  syncToggleWithDarkMode();
  syncToggleSectionVisibility('pokedexes-container', 'togglePokedexes', true);
  syncToggleSectionVisibility('medals-container', 'toggleMedals', true);
  syncToggleSectionVisibility('events-container', 'toggleEvents', true);

  // Navigation logic
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const sectionId = btn.getAttribute("data-section");
      document.querySelectorAll(".section").forEach(section => {
        section.style.display = (section.id === sectionId) ? "" : "none";
        section.classList.toggle("active", section.id === sectionId);
      });
    });
  });
}

function toggleTCGSettingsModal() {
  const modal = document.getElementById("settings-modal-tcg");
  modal.classList.toggle("hidden");

  if (!modal.classList.contains("hidden")) {
    syncToggleWithDarkMode();
    // Add other syncs if needed
  }
}

function toggleCardHomeSettingsModal() {
  const modal = document.getElementById('card-home-settings-modal');
  if (modal) modal.classList.toggle('hidden');
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
  // Get the actual current state from localStorage
  const currentState = localStorage.getItem("darkMode") === "enabled";
  const newState = !currentState;

  // Apply new state
  document.body.classList.toggle("dark-mode", newState);
  localStorage.setItem("darkMode", newState ? "enabled" : "disabled");

  // Sync all toggle checkboxes
  const toggles = document.querySelectorAll(".dark-mode-toggle");
  toggles.forEach(t => {
    t.checked = newState;
  });
}

function syncToggleWithDarkMode() {
  const isDarkMode = localStorage.getItem("darkMode") === "enabled";
  document.body.classList.toggle("dark-mode", isDarkMode);

  const toggles = document.querySelectorAll(".dark-mode-toggle");
  toggles.forEach(toggle => {
    toggle.checked = isDarkMode;
  });
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

function renderCardSet(setKey, filter = "all") {
  currentFilter[setKey] = filter;

  const set = cardSets[setKey];
  if (!set) return console.error(`Card set not found: ${setKey}`);

  const app = document.getElementById("app");
  const searchTerm = currentSearch[setKey]?.toLowerCase() || "";

  const filteredCards = set.data.filter(card => {
    const matchesFilter =
      filter === "have" ? card.caught :
      filter === "need" ? !card.caught :
      filter === "favorite" ? card.favorite :
      true;

    const matchesSearch = card.name.toLowerCase().includes(searchTerm) || card.number.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const cardsHTML = filteredCards.map((card, i) => `
    <div class="pokemon-card ${card.caught ? 'caught' : ''}" onclick="toggleCard('${setKey}', ${i})">
      <img src="${card.img}" alt="${card.name}" />
      <div>${card.name}</div>
      <div>${card.number}</div>
      ${card.caught ? '<div class="checkmark">✔️</div>' : ''}
      <div class="favorite-icon" onclick="event.stopPropagation(); toggleCardFavorite('${setKey}', ${i}, this)">
        ${card.favorite ? '🌝' : '🌚'}
      </div>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="top-bar">
      <button class="back-button" onclick="goHome()">← Back</button>
      <div class="settings-container-2">
        <i class="fas fa-cog settings-icon" onclick="toggleCardsSettingsModal()"></i>
      </div>
    </div>
    <h1>${set.title}</h1>
    <h1 id="caught-counter">(${getCaughtCount(set.data)} / ${set.total})</h1>
    ${renderFilterControls(setKey, filter, 'cards')}
    <div class="search-bar">
      <input id="search-${setKey}" type="text" placeholder="Search..." />
    </div>
    <div class="pokedex-grid">${cardsHTML}</div>
    <div class="copyright-container">
      <h5>© 2025 PokeLibrary. This website has been made by Cooper.</h5>
    </div>

    <div id="card-settings-modal" class="modal hidden">
  <div class="modal-content">
    <span class="close-button" onclick="toggleCardsSettingsModal()">×</span>
    <h2>Settings</h2>
      ${renderRegionButtons(setKey)}
      <button class="download-button" onclick="downloadPDF('${setKey}')">Download PDF</button>
  </div>
</div>
  `;

  const searchInput = document.getElementById(`search-${setKey}`);
  searchInput.value = currentSearch[setKey] || "";

  searchInput.addEventListener("input", (e) => {
    const input = e.target;
    const value = input.value;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    currentSearch[setKey] = value;
    renderCardSet(setKey, currentFilter[setKey]);

    const newInput = document.getElementById(`search-${setKey}`);
    newInput.focus();
    newInput.setSelectionRange(start, end);
  });
}

function toggleCardsSettingsModal() {
  const modal = document.getElementById('card-settings-modal');
  if (modal) modal.classList.toggle('hidden');
}

function toggleCard(setKey, index) {
  const card = cardSets[setKey].data[index];
  card.caught = !card.caught;
  localStorage.setItem("cardSets", JSON.stringify(cardSets));  // Save state to localStorage
  renderCardSet(setKey, currentFilter[setKey] || "all");
}

function toggleCardFavorite(setKey, index, iconElement) {
  const card = cardSets[setKey].data[index];
  card.favorite = !card.favorite;
  iconElement.innerHTML = card.favorite ? '🌝' : '🌚';
  localStorage.setItem("cardSets", JSON.stringify(cardSets));  // Save state to localStorage
}

function loadCardSets() {
  const saved = localStorage.getItem("cardSets");
  if (saved) {
    const parsed = JSON.parse(saved);
    for (const key in parsed) {
      if (cardSets[key]) {
        const savedData = parsed[key].data;
        const currentData = cardSets[key].data;

        for (let i = 0; i < currentData.length; i++) {
          if (savedData[i]) {
            currentData[i].caught = savedData[i].caught ?? false;
            currentData[i].favorite = savedData[i].favorite ?? false;
          }
        }
      }
    }
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

function renderTCGSet(setKey, filter = "all") {
  currentFilter[setKey] = filter;
  
  const set = tcgSets[setKey];
  if (!set) return console.error(`TCG set not found: ${setKey}`);
  const app = document.getElementById("app");

const searchTerm = currentSearch[setKey]?.toLowerCase() || "";
const filteredCards = set.data.filter(card => {
  const matchesFilter =
    currentFilter[setKey] === "have" ? card.caught :
    currentFilter[setKey] === "need" ? !card.caught :
    currentFilter[setKey] === "favorite" ? card.favorite :
    true;

  const matchesSearch = card.name.toLowerCase().includes(searchTerm) || card.number.includes(searchTerm);
  return matchesFilter && matchesSearch;
});

  const cardsHTML = filteredCards.map((card, i) => {
    return `
      <div class="pokemon-card ${card.caught ? 'caught' : ''}" onclick="toggleTCGCard('${setKey}', ${i})">
        <img src="${card.img}" alt="${card.name}" />
        <div>${card.name}</div>
        <div>${card.number}</div>
        ${card.caught ? '<div class="checkmark">✔️</div>' : ''}
        <div class="favorite-icon" onclick="event.stopPropagation(); toggleTCGFavorite('${setKey}', ${i}, this)">
          ${card.favorite ? '🌝' : '🌚'}
        </div>
      </div>
    `;
  }).join("");

app.innerHTML = `
  <div class="top-bar">
    <button class="back-button" onclick="goHome()">← Back</button>
    <div class="settings-container-2">
      <i class="fas fa-cog settings-icon" onclick="toggleSecondSettingsModal()"></i>
    </div>
  </div>
  <h1>${set.title}</h1>
  <h1 id="caught-counter">(${getCaughtCount(set.data)} / ${set.total})</h1>
  ${renderFilterControls(setKey, filter, 'tcg')}
  <div class="search-bar">
    <input id="search-${setKey}" type="text" placeholder="Search..." />
  </div>
  <div class="pokedex-grid">${cardsHTML}</div>

  <div class="copyright-container">
    <h5>© 2025 PokeLibrary. This website has been made by Cooper.</h5>
  </div>

  <div id="second-settings-modal" class="modal hidden second-modal">
    <div class="modal-content second-modal-content">
      <span class="close-button" onclick="toggleSecondSettingsModal()">×</span>
      <h2>Settings</h2>
      ${renderRegionButtons(setKey)}
      <button class="download-button" onclick="downloadPDF('${setKey}')">Download PDF</button>
    </div>
  </div>
`;

const searchInput = document.getElementById(`search-${setKey}`);
searchInput.value = currentSearch[setKey] || "";

searchInput.addEventListener("input", (e) => {
  const input = e.target;
  const value = input.value;
  const start = input.selectionStart;
  const end = input.selectionEnd;

  currentSearch[setKey] = value;
  renderTCGSet(setKey, currentFilter[setKey]);

  // Restore focus and cursor position after re-render
  const newInput = document.getElementById(`search-${setKey}`);
  newInput.focus();
  newInput.setSelectionRange(start, end);
});
}

function toggleTCGCard(setKey, cardIndex) {
  const card = tcgSets[setKey].data[cardIndex];
  card.caught = !card.caught;
  localStorage.setItem("tcgSets", JSON.stringify(tcgSets));
  renderTCGSet(setKey, currentFilter[setKey] || "all");
}

function toggleTCGFavorite(setKey, cardIndex, iconElement) {
  const card = tcgSets[setKey].data[cardIndex];
  card.favorite = !card.favorite;
  iconElement.innerHTML = card.favorite ? '🌝' : '🌚';
  localStorage.setItem("tcgSets", JSON.stringify(tcgSets));
}

function loadTCGSets() {
  const saved = localStorage.getItem("tcgSets");
  if (saved) {
    const parsed = JSON.parse(saved);
    for (const key in parsed) {
      if (tcgSets[key]) {
        // Merge saved data with current cards
        const savedData = parsed[key].data;
        const currentData = tcgSets[key].data;

        for (let i = 0; i < currentData.length; i++) {
          if (savedData[i]) {
            currentData[i].caught = savedData[i].caught ?? false;
            currentData[i].favorite = savedData[i].favorite ?? false;
          }
        }
      }
    }
  }
}

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
      <div class="settings-container-2">
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
          <div class="pokemon-card ${pokemon.caught ? 'caught' : ''}" onclick="toggleCaught('${key}', '${medals[key] ? pokemon.id : pokemon.number}', this)">
            <img src="${pokemon.img}" alt="${pokemon.name}" />
            <div>${pokemon.name}</div>
            <div>${pokemon.number}</div>
            ${pokemon.caught ? `<div class="checkmark">✔️</div>` : ''}
            <div class="favorite-icon" onclick="event.stopPropagation(); toggleFavorite('${key}', '${medals[key] ? pokemon.id : pokemon.number}', this)">
              ${pokemon.favorite ? '🌝' : '🌚'}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="copyright-container">
      <h5>© 2025 PokeLibrary. This website has been made by Cooper.</h5>
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

function renderFilterControls(key, selected, type = 'pokedex') {
  let handler;
  if (type === 'tcg') handler = 'renderTCGSet';
  else if (type === 'cards') handler = 'renderCardSet';
  else handler = 'renderPokedex';

  return `
    <div class="filter-bar">
      <button class="${selected === 'all' ? 'active' : ''}" onclick="${handler}('${key}', 'all')">All</button>
      <button class="${selected === 'have' ? 'active' : ''}" onclick="${handler}('${key}', 'have')">Have</button>
      <button class="${selected === 'need' ? 'active' : ''}" onclick="${handler}('${key}', 'need')">Need</button>
      <button class="${selected === 'favorite' ? 'active' : ''}" onclick="${handler}('${key}', 'favorite')">Favorite</button>
    </div>
  `;
}

function toggleCaught(key, id, cardElement) {
  const dex = pokedexes[key] || medals[key] || events[key];
  const pokemon = dex.data.find(p => (medals[key] ? p.id === id : p.number === id) && !p.isRegionTitle);
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

  // ---- NEW CODE START ----
  // Update region button selection state after toggling a pokemon

  // Get the regionBreaks and selectedRegion for this dex
  const regionBreaks = dex.regionBreaks;
  if (!regionBreaks || !selectedRegion[key]) return;

  // Find which region this pokemon belongs to by its real index (ignoring region titles)
  let realIndex = -1;
  let regionIndex = -1;
  for (let i = 0; i < dex.data.length; i++) {
    const p = dex.data[i];
    if (!p.isRegionTitle) realIndex++;
    if (p.number === id) {
      // Find region index where realIndex fits between start and end
      for (let j = 0; j < regionBreaks.length; j++) {
        const start = regionBreaks[j].index;
        const end = (j + 1 < regionBreaks.length) ? regionBreaks[j + 1].index - 1 : dex.data.length - 1;

        // Because regionBreaks index uses raw index including region titles, adjust accordingly:
        // realIndex counts only pokemon ignoring titles, but regionBreaks index counts titles.
        // So we need to map realIndex back to dex.data index.
        // We'll do this by counting non-title pokemons up to the region break's index.

        // Let's try matching by regionBreak raw index vs dex.data index:
        if (i >= start && i <= end) {
          regionIndex = j;
          break;
        }
      }
      break;
    }
  }

  if (regionIndex === -1) return;

  // Now check if all pokemons in that region are caught
  const start = regionBreaks[regionIndex].index;
  const end = (regionIndex + 1 < regionBreaks.length) ? regionBreaks[regionIndex + 1].index - 1 : dex.data.length - 1;

  // Check all pokemons (ignore region titles) in this range:
  let allCaught = true;
  for (let i = start; i <= end; i++) {
    const p = dex.data[i];
    if (!p || p.isRegionTitle) continue;
    if (!p.caught) {
      allCaught = false;
      break;
    }
  }

  // Update selectedRegion set accordingly
  if (allCaught) {
    selectedRegion[key].add(regionIndex);
  } else {
    selectedRegion[key].delete(regionIndex);
  }

  // Save selected regions in localStorage
  localStorage.setItem(`selectedRegion_${key}`, JSON.stringify(Array.from(selectedRegion[key])));

  // Update UI for region buttons to reflect new state
  const regionButtons = document.querySelectorAll(".region-button");
  regionButtons.forEach(button => {
    if (Number(button.dataset.index) === regionIndex) {
      if (allCaught) {
        button.classList.add("selected");
      } else {
        button.classList.remove("selected");
      }
    }
  });
  // ---- NEW CODE END ----
}

function toggleFavorite(key, id, iconElement) {
  const dex = pokedexes[key] || medals[key] || events[key];
  const pokemon = dex.data.find(p => (medals[key] ? p.id === id : p.number === id) && !p.isRegionTitle);
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
  { name: "Unidentified", index: 1005 },
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
  const pokedex = pokedexes[key] || medals[key] || events[key]  || tcgSets[key] || cardSets[key];
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