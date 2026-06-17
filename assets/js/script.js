class AniLog {
  animeData = [];
  animeItems = [];

  constructor() {
    this.filters = {
      status: "all",
      year: "all",
      season: "all",
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
    this.ui.toolbar.addEventListener("change", () => this.#changeToolbar());
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

    div.innerHTML = [
      `<div class="anime-list__item-title">${anime.title}</div>`,
      `<div class="anime-list__item-meta">`,
      `<span class="anime-list__item-tag">${anime.series}</span>`,
      `<span class="anime-list__item-tag">${anime.year}年</span>`,
      `<span class="anime-list__item-tag">${anime.season}</span>`,
      `<span class="anime-list__item-tag">${anime.status}</span>`,
      `</div>`,
    ].join("");

    return div;
  }

  #renderAnimeList() {
    this.ui.animeList.textContent = "";
    this.ui.animeList.append(...this.animeItems.map((item) => item.dom));
  }

  //

  #changeToolbar() {
    this.ui.toolbar.querySelectorAll("details").forEach((details) => (details.open = false));
    const formData = Object.fromEntries(new FormData(this.ui.toolbar));

    this.#updateSettings(formData);

    for (const item of this.animeItems) {
      const visible = this.#matchFilter(item) && this.#matchSearch(item, formData.q);
      item.dom.classList.toggle("hidden", !visible);
    }

    this.#sortAnimeList();
    this.#renderAnimeList();
  }

  #updateSettings(formData) {
    for (const key in formData) {
      if (key in this.filters) this.filters[key] = formData[key];
      if (key in this.sort) this.sort[key] = formData[key];
    }
  }

  #matchFilter(item) {
    for (const [key, value] of Object.entries(this.filters)) {
      if (value === "all") continue;

      if (key === "year") {
        if (item.anime.year !== Number(value)) return false;
        continue;
      }

      if (item.anime[key] !== value) return false;
    }

    return true;
  }

  #matchSearch(item, keyword) {
    if (!keyword.trim()) return true;
    return item.anime.title.includes(keyword);
  }

  #sortAnimeList() {
    const seasonOrder = { winter: 0, sprint: 1, summer: 2, fall: 3 };

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
}

const app = new AniLog();
app.init();
