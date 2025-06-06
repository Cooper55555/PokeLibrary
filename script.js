document.addEventListener("DOMContentLoaded", () => {
  loadCaughtStatus();
  goHome();
});

const currentFilter = {}; // stores active filter per dex

function goHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>Collections</h1>
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
    <a href="https://discord.gg/t5BGDzzSXg" target="_blank" class="discord-button">Join Our Discord</a>
  `;
}

function renderPokedex(key, filter = "all") {
  const pokedex = pokedexes[key];
  const app = document.getElementById("app");

  currentFilter[key] = filter;

  const filteredList = pokedex.data.filter(p => {
    if (filter === "have") return p.caught;
    if (filter === "need") return !p.caught;
    return true;
  });

  app.innerHTML = `
    <button class="back-button" onclick="goHome()">← Back</button>
    <h1>${pokedex.title} (${getCaughtCount(pokedex.data)} / ${pokedex.total})</h1>
    ${renderFilterControls(key, filter)}
    <div class="pokedex-grid">
      ${filteredList.map((pokemon, index) => `
        <div class="pokemon-card ${pokemon.caught ? 'caught' : ''}" onclick="toggleCaught('${key}', ${pokedex.data.indexOf(pokemon)})">
          <img src="${pokemon.img}" alt="${pokemon.name}" />
          <div>${pokemon.name}</div>
          <div>#${pokemon.number}</div>
          ${pokemon.caught ? `<div class="checkmark">✔️</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderFilterControls(key, selected) {
  return `
    <div class="filter-bar">
      <button class="${selected === 'all' ? 'active' : ''}" onclick="renderPokedex('${key}', 'all')">All</button>
      <button class="${selected === 'have' ? 'active' : ''}" onclick="renderPokedex('${key}', 'have')">Have</button>
      <button class="${selected === 'need' ? 'active' : ''}" onclick="renderPokedex('${key}', 'need')">Need</button>
    </div>
  `;
}

function toggleCaught(key, index) {
  pokedexes[key].data[index].caught = !pokedexes[key].data[index].caught;
  saveCaughtStatus();
  renderPokedex(key, currentFilter[key]);
}

function getCaughtCount(pokemonList) {
  return pokemonList.filter(p => p.caught).length;
}

function getPercentage(pokemonList) {
  const total = pokemonList.length;
  const caught = getCaughtCount(pokemonList);
  return ((caught / total) * 100).toFixed(2);
}

const STORAGE_KEY = "pokemonCaughtStatus";

function saveCaughtStatus() {
  const status = {};
  for (const [dexKey, dex] of Object.entries(pokedexes)) {
    status[dexKey] = dex.data.map(p => p.caught);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
}

function loadCaughtStatus() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const status = JSON.parse(saved);
  for (const [dexKey, caughtArray] of Object.entries(status)) {
    if (pokedexes[dexKey]) {
      pokedexes[dexKey].data.forEach((p, i) => {
        p.caught = caughtArray[i] ?? false;
      });
    }
  }
}