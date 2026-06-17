class AniLog {
  animeData = [];
  animeItems = [];

  async init() {
    this.ui = this.#getUi();

    this.animeData = await this.#loadAnimeData();
    this.animeItems = this.#generateAnimeItems();

    this.#renderAnimeList();
  }

  #getUi() {
    const ui = {};
    [...document.querySelectorAll("[data-ui]")].forEach((el) => (ui[el.dataset.ui] = el));
    return ui;
  }

  async #loadAnimeData() {
    const res = await fetch("assets/data/data.json");
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
      `</div>`,
    ].join("");

    return div;
  }

  #renderAnimeList() {
    this.ui.animeList.textContent = "";
    this.ui.animeList.append(...this.animeItems.map((item) => item.dom));
  }
}

const app = new AniLog();
app.init();
