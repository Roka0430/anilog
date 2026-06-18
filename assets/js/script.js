class AniLog {
  constructor() {
    this.animeData = [];
    this.animeItems = [];

    this.keyword = "";

    this.filters = {
      status: null,
      year: null,
      season: null,
    };

    this.sort = {
      order: "broadcast",
    };
  }

  async init() {
    this.ui = this.#getUi();
    this.#bindEvent();

    this.animeData = await this.#loadAnimeData();
    this.animeItems = this.#generateAnimeItems();

    this.#setupYearFilter();

    this.#sortAnimeList();
    this.#renderAnimeList();
  }

  #getUi() {
    const ui = {};
    [...document.querySelectorAll("[data-ui]")].forEach((el) => (ui[el.dataset.ui] = el));
    return ui;
  }

  #bindEvent() {
    this.ui.toolbar.addEventListener("submit", (e) => e.preventDefault());
    this.ui.toolbar.addEventListener("change", () => this.#onchangeToolbar());
    this.ui.animeList.addEventListener("click", (e) => this.#onclickAnimeList(e));
  }

  async #loadAnimeData() {
    const res = await fetch(`assets/data/data.json?t=${Date.now()}`);
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  }

  #generateAnimeItems() {
    const animeItems = [];
    for (const anime of this.animeData) {
      animeItems.push({
        anime: anime,
        dom: this.#createAnimeElement(anime),
      });
    }
    return animeItems;
  }

  #createAnimeElement(anime) {
    const div = document.createElement("div");
    div.className = "anime-list__item";

    const proper = (text) => text[0].toUpperCase() + text.slice(1);

    div.innerHTML = [
      `<div class="anime-list__item-title">${anime.title}</div>`,
      `<div class="anime-list__item-meta">`,
      `<span class="anime-list__item-tag" data-tag="year" data-value="${anime.year}">${anime.year}</span>`,
      `<span class="anime-list__item-tag" data-tag="season" data-value="${anime.season}">${proper(anime.season)}</span>`,
      `<span class="anime-list__item-tag" data-tag="status" data-value="${anime.status}">${proper(anime.status)}</span>`,
      `</div>`,
    ].join("");

    return div;
  }

  #setupYearFilter() {
    const years = this.animeData.map((anime) => anime.year);
    const sortedYears = [...new Set(years)].sort((a, b) => b - a);
    for (const year of sortedYears)
      this.ui.yearFilter.insertAdjacentHTML(
        "beforeend",
        `<label><input class="anime-list__filter-option" type="radio" name="year" value="${year}">${year}</label>`,
      );
  }

  #sortAnimeList() {
    const seasonOrder = { winter: 0, spring: 1, summer: 2, fall: 3 };

    switch (this.sort.order) {
      case "title":
        this.animeItems.sort((a, b) => a.anime.title.localeCompare(b.anime.title));
        break;
      case "broadcast":
        this.animeItems.sort((a, b) => {
          const keyA = a.anime.year * 10 + seasonOrder[a.anime.season];
          const keyB = b.anime.year * 10 + seasonOrder[b.anime.season];
          return keyB - keyA;
        });
        break;
    }
  }

  #renderAnimeList() {
    this.ui.animeList.textContent = "";
    const visibleItems = this.animeItems.filter((item) => this.#matchFilter(item) && this.#matchSearch(item));
    this.ui.animeList.append(...visibleItems.map((i) => i.dom));
    this.#updateListInfo(this.animeData.length, visibleItems.length);
  }

  #matchFilter(item) {
    for (const [key, filter] of Object.entries(this.filters)) {
      if (filter === null) continue;
      if (item.anime[key] !== filter) return false;
    }
    return true;
  }

  #matchSearch(item) {
    if (!this.keyword.trim()) return true;
    return item.anime.title.includes(this.keyword);
  }

  #updateListInfo(total, visible) {
    if (total == null || visible == null) return;

    if (total === 0) {
      this.ui.infoContent.textContent = "No anime found";
      return;
    }

    if (visible === 0) {
      this.ui.infoContent.textContent = "No matching anime found";
      return;
    }

    if (total === visible) {
      this.ui.infoContent.textContent = `Showing all ${total} anime`;
      return;
    }

    this.ui.infoContent.textContent = `Showing ${visible} of ${total} anime`;
  }

  #onchangeToolbar() {
    this.ui.toolbar.querySelectorAll("details").forEach((details) => (details.open = false));
    const formData = Object.fromEntries(new FormData(this.ui.toolbar));

    this.keyword = formData.q;
    this.#updateSettings(formData);

    this.#sortAnimeList();
    this.#renderAnimeList();
  }

  #updateSettings(formData) {
    for (const key in formData) {
      if (key in this.filters) this.filters[key] = this.#castKeyValue(key, formData[key]);
      if (key in this.sort) this.sort[key] = this.#castKeyValue(key, formData[key]);
    }
  }

  #castKeyValue(key, value) {
    if (value === "all" || value === "" || value === null) return null;

    switch (key) {
      case "year":
        return Number(value);
      default:
        return value;
    }
  }

  #onclickAnimeList(e) {
    const target = e.target;
    if (!target.classList.contains("anime-list__item-tag")) return;

    const tag = target.dataset.tag;
    const value = this.#castKeyValue(tag, target.dataset.value);

    const radio = this.ui.toolbar.querySelector(`input[type="radio"][name="${tag}"][value="${value}"]`);
    if (!radio) return;

    radio.checked = true;
    this.#onchangeToolbar();
  }
}

const app = new AniLog();
app.init();
