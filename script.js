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
    } else if (key === "shinydynamax") {
      regionBreaks = REGION_BREAKS_SHINYDYNAMAX;
    } else {
      regionBreaks = REGION_BREAKS_STANDARD;
    }

    insertRegionTitles(pokedex, regionBreaks);
  }

  loadCaughtStatus();
  goHome();
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

function goHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>Pokemon Go Pokedexes</h1>
    <div class="collections">
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
    <h1>Pokemon Go Medals</h1>
    <div class="collections">
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
  	  <div class="social-button-container">
        <a href="https://discord.gg/t5BGDzzSXg" target="_blank" class="social-button discord"><i class="fab fa-discord"></i></a>
        <a href="https://median.co/share/rrabnz#apk" target="_blank" class="social-button android"><i class="fab fa-android"></i></a>
      </div>
    <div class="copyright-container">
        <h5>© 2025 PokeLibrary. This website has been made by Cooper.</h5>
    </div>
  `;
}

function renderPokedex(key, filter = "all") {
  const pokedex = pokedexes[key] || medals[key];
  if (!pokedex) {
    console.error(`Pokedex or Medal not found for key: ${key}`);
    return;
  }

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
      <button class="download-button" onclick="downloadPDF('${key}')">Download PDF</button>
    </div>
    <h1>${pokedex.title}</h1>
    <h1 id="caught-counter">(${getCaughtCount(pokedex.data)} / ${pokedex.total})</h1>
    ${renderFilterControls(key, filter)}
    <div class="search-bar">
      <input id="search-${key}" type="text" placeholder="${pokedexes[key] ? 'Search Pokémon...' : 'Search Medal...'}" />
    </div>
    <div class="pokedex-grid">
      ${filteredList.map((pokemon, i) => {
        if (pokemon.isRegionTitle) {
          return `<div class="region-title">${pokemon.name}</div>`;
        }
        if (medals[key]) {
          // For medals, use index for uniqueness
          return `
            <div class="pokemon-card ${pokemon.caught ? 'caught' : ''}" onclick="toggleCaught('${key}', ${i}, this)">
              <img src="${pokemon.img}" alt="${pokemon.name}" />
              <div>${pokemon.name}</div>
              <div>${pokemon.number}</div>
              ${pokemon.caught ? `<div class="checkmark">✔️</div>` : ''}
              <div class="favorite-icon" onclick="event.stopPropagation(); toggleFavorite('${key}', ${i}, this)">
                ${pokemon.favorite ? '🌝' : '🌚'}
              </div>
            </div>
          `;
        } else {
          // For pokedexes, use number for uniqueness
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
        }
      }).join('')}
    </div>
  `;

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
  const dex = pokedexes[key] || medals[key];
  let pokemon;

  if (medals[key]) {
    // id is index for medals
    pokemon = dex.data[id];
  } else {
    // id is number for pokedexes
    pokemon = dex.data.find(p => p.number === id && !p.isRegionTitle);
  }
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
  const dex = pokedexes[key] || medals[key];
  let pokemon;

  if (medals[key]) {
    // id is index for medals
    pokemon = dex.data[id];
  } else {
    pokemon = dex.data.find(p => p.number === id && !p.isRegionTitle);
  }
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

const STORAGE_KEY = "pokemonCaughtStatus";

function saveCaughtStatus() {
  const status = {};

  for (const [dexKey, dex] of Object.entries(pokedexes)) {
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
        // Use index-based key for medals, to handle duplicate numbers
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
    const dex = pokedexes[dexKey] || medals[dexKey];
    if (!dex) continue;

    dex.data.forEach((p, i) => {
      if (!p.isRegionTitle) {
        if (medals[dexKey]) {
          // medals use index-based key
          const uniqueKey = `${dexKey}_${i}`;
          const savedObj = savedMap[uniqueKey];
          if (savedObj) {
            p.caught = savedObj.caught ?? false;
            p.favorite = savedObj.favorite ?? false;
          }
        } else {
          // pokedex use number key
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
  const pokedex = pokedexes[key] || medals[key];
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
      y += 7;
    }

    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save(`${pokedex.title.replace(/\s+/g, "_")}.pdf`);
}