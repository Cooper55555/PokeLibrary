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

const currentFilter = {};
const currentSearch = {};

function goHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>Pokemon Go Collections</h1>
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
    <div class="button-container">
        <a href="https://discord.gg/t5BGDzzSXg" target="_blank" class="discord-button">Join Our Discord</a>
        <a href="https://median.co/share/rrabnz#apk" target="_blank" class="app-button">Download App APK</a>
    </div>
    <div class="copyright-container">
        <h5>© 2025 PokeLibrary. This website has been made by Cooper.</h5>
    </div>
  `;
}

function renderPokedex(key, filter = "all") {
  const pokedex = pokedexes[key];
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
      <input id="search-${key}" type="text" placeholder="Search Pokémon..." />
    </div>
    <div class="pokedex-grid">
      ${filteredList.map((pokemon, displayIndex) => {
        if (pokemon.isRegionTitle) {
          return `<div class="region-title">${pokemon.name}</div>`;
        }
        const globalIndex = pokedex.data.indexOf(pokemon);
        return `
          <div class="pokemon-card ${pokemon.caught ? 'caught' : ''}" onclick="toggleCaught('${key}', ${globalIndex}, this)">
            <img src="${pokemon.img}" alt="${pokemon.name}" />
            <div>${pokemon.name}</div>
            <div>#${pokemon.number}</div>
            ${pokemon.caught ? `<div class="checkmark">✔️</div>` : ''}
            <div class="favorite-icon" onclick="event.stopPropagation(); toggleFavorite('${key}', ${globalIndex}, this)">
              ${pokemon.favorite ? '🌝' : '🌚'}
            </div>
          </div>
        `;
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

function toggleCaught(key, index, cardElement) {
  const pokemon = pokedexes[key].data[index];
  if (pokemon.isRegionTitle) return;

  pokemon.caught = !pokemon.caught;
  saveCaughtStatus();

  if (pokemon.caught) {
    cardElement.classList.add('caught');
    if (!cardElement.querySelector(".checkmark")) {
      cardElement.innerHTML += `<div class="checkmark">✔️</div>`;
    }
  } else {
    cardElement.classList.remove('caught');
    const check = cardElement.querySelector(".checkmark");
    if (check) check.remove();
  }

  const counter = document.getElementById("caught-counter");
  counter.textContent = `(${getCaughtCount(pokedexes[key].data)} / ${pokedexes[key].total})`;
}

function toggleFavorite(key, index, iconElement) {
  const pokemon = pokedexes[key].data[index];
  if (pokemon.isRegionTitle) return;

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
    status[dexKey] = dex.data.map(p =>
      p.isRegionTitle ? null : { caught: p.caught, favorite: p.favorite }
    );
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
}

function loadCaughtStatus() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const status = JSON.parse(saved);
  for (const [dexKey, savedArray] of Object.entries(status)) {
    if (pokedexes[dexKey]) {
      pokedexes[dexKey].data.forEach((p, i) => {
        if (!p.isRegionTitle) {
          const savedObj = savedArray[i] ?? {};
          p.caught = savedObj.caught ?? false;
          p.favorite = savedObj.favorite ?? false;
        }
      });
    }
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
  { name: "Johto", index: 14 },
  { name: "Hoenn", index: 17 },
  { name: "Unova", index: 20 },
  { name: "Galar", index: 25 },
];

const REGION_BREAKS_SHINYDYNAMAX = [
  { name: "Kanto", index: 0 },
  { name: "Johto", index: 14 },
  { name: "Hoenn", index: 17 },
  { name: "Unova", index: 20 },
  { name: "Galar", index: 25 },
];

const REGION_BREAKS_GIGANTAMAX = [
  { name: "Kanto", index: 0 },
  { name: "Galar", index: 8 },
];

const REGION_BREAKS_SHINYGIGANTAMAX = [
  { name: "Kanto", index: 0 },
  { name: "Galar", index: 8 },
];

const REGION_BREAKS_MEGA = [
  { name: "Kanto", index: 0 },
  { name: "Johto", index: 13 },
  { name: "Hoenn", index: 19 },
  { name: "Sinnoh", index: 35 },
  { name: "Kalos", index: 38 },
];

function insertRegionTitles(pokedex, regionBreaks) {
  const clonedData = [...pokedex.data];
  regionBreaks.slice().reverse().forEach(({ name, index }) => {
    if (index <= clonedData.length) {
      clonedData.splice(index, 0, {
        name: `${name} Region`,
        number: "",
        img: "",
        isRegionTitle: true,
      });
    }
  });
  pokedex.data = clonedData;
}

function downloadPDF(key) {
  const pokedex = pokedexes[key];
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