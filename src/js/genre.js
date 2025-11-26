import { MovieGrid } from "./components/MovieGrid.js";
import { Pagination } from "./components/Pagination.js";
import { TMDbService } from "./api/tmdbService.js";

class GenrePage {
  constructor() {
    this.movieGrid = new MovieGrid(".genre-movies-list");
    this.pagination = new Pagination(".pagination");
    this.tmdbService = new TMDbService();
    this.genreId = this.getGenreIdFromURL();
    this.genreName = this.getGenreNameFromURL();
    this.currentPage = 1;

    console.log("GenrePage initialized:", {
      genreId: this.genreId,
      genreName: this.genreName,
    });
    this.init();
  }

  getGenreIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  getGenreNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return decodeURIComponent(urlParams.get("name") || "Genre");
  }

  async init() {
    if (!this.genreId) {
      console.error("No genre ID found in URL");
      this.showError("Genre not specified");
      return;
    }

    console.log("Starting initialization...");
    this.updatePageTitle();
    await this.loadGenres();
    await this.loadGenreMovies(1);
    this.setupPagination();
    this.setupSearchHandler();
    this.setupGenresDropdown();
  }

  updatePageTitle() {
    document.getElementById(
      "genreTitle"
    ).textContent = `${this.genreName} Movies`;
    document.title = `${this.genreName} Movies - Movie Finder`;
  }

  async loadGenres() {
    try {
      console.log("Loading genres...");
      const genres = await this.tmdbService.getGenres();
      console.log("Genres loaded:", genres);
      this.renderGenreSidebar(genres);
    } catch (error) {
      console.error("Failed to load genres:", error);
    }
  }

  renderGenreSidebar(genres) {
    const sidebar = document.querySelector(".genre-list-container");
    if (!sidebar) {
      console.error("Genre sidebar container not found");
      return;
    }

    console.log("Rendering genre sidebar with", genres.length, "genres");

    // پیدا کردن ID واقعی برای ژانر فعلی
    let currentGenreId = this.genreId;
    if (isNaN(this.genreId)) {
      // اگر genreId نام ژانر است، ID واقعی را پیدا کن
      currentGenreId = this.tmdbService.getGenreIdByName(this.genreName);
    }

    sidebar.innerHTML = genres
      .map((genre) => {
        const isActive = genre.id.toString() === currentGenreId?.toString();
        return `
        <div class="genre-list-item ${isActive ? "active" : ""}" 
             data-genre-id="${genre.id}" 
             data-genre-name="${genre.name}">
          ${genre.name}
        </div>
      `;
      })
      .join("");

    // آپدیت genreId با ID واقعی
    if (currentGenreId && this.genreId !== currentGenreId) {
      this.genreId = currentGenreId;
    }

    this.setupGenreClickHandlers();
  }

  setupGenreClickHandlers() {
    const genreItems = document.querySelectorAll(".genre-list-item");
    console.log(
      "Setting up click handlers for",
      genreItems.length,
      "genre items"
    );

    genreItems.forEach((item) => {
      item.addEventListener("click", () => {
        const genreId = item.dataset.genreId;
        const genreName = item.dataset.genreName;

        console.log("Genre clicked:", { genreId, genreName });

        genreItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        this.genreId = genreId;
        this.genreName = genreName;
        this.updatePageTitle();
        this.loadGenreMovies(1);

        window.history.pushState(
          {},
          "",
          `?id=${genreId}&name=${encodeURIComponent(genreName)}`
        );
      });
    });
  }

  async loadGenreMovies(page = 1) {
    try {
      console.log(
        "Loading genre movies for genreId:",
        this.genreId,
        "page:",
        page
      );
      this.showLoading();
      this.currentPage = page;

      const result = await this.tmdbService.getMoviesByGenre(
        this.genreId,
        page
      );
      console.log("Movies loaded:", result);

      document.getElementById(
        "resultsCount"
      ).textContent = `${result.totalResults} titles`;
      document.getElementById("resultsCount").style.display = "inline";

      this.movieGrid.renderMovies(result.movies);
      this.pagination.update(result.totalResults, 20, page);
    } catch (error) {
      console.error("Failed to load genre movies:", error);
      this.showError("Failed to load genre movies: " + error.message);
    }
  }

  showLoading() {
    const movieList = document.querySelector(".genre-movies-list");
    if (movieList) {
      movieList.innerHTML = `
        <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 1rem;">Loading movies...</p>
        </div>
      `;
    }
  }

  showError(message) {
    const movieList = document.querySelector(".genre-movies-list");
    if (movieList) {
      movieList.innerHTML = `
        <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
          <p>${message}</p>
          <button onclick="location.reload()" style="margin-top: 1rem; padding: 8px 16px; background: var(--accent-color); color: #000; border: none; border-radius: 4px; cursor: pointer;">Try Again</button>
        </div>
      `;
    }
  }

  setupPagination() {
    this.pagination.onPageChange = (page) => {
      console.log("Page changed to:", page);
      this.loadGenreMovies(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  setupSearchHandler() {
    const searchInput = document.querySelector(".search-input");
    const searchButton = document.querySelector(".search-icon-btn");

    if (!searchInput || !searchButton) {
      console.error("Search elements not found");
      return;
    }

    const performSearch = () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        window.location.href = `../../index.html?search=${encodeURIComponent(
          query
        )}`;
      }
    };

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });

    searchButton.addEventListener("click", performSearch);
  }

  async setupGenresDropdown() {
    const genresMenu = document.querySelector(".genres-menu");
    const dropdownBtn = document.querySelector(".dropdown-btn");

    if (!genresMenu || !dropdownBtn) {
      console.error("Genres dropdown elements not found");
      return;
    }

    try {
      const genres = await this.tmdbService.getGenres();
      genresMenu.innerHTML = genres
        .map(
          (genre) => `
        <div class="genre-item" data-genre-id="${genre.id}">${genre.name}</div>
      `
        )
        .join("");

      genresMenu.addEventListener("click", (e) => {
        const genreItem = e.target.closest(".genre-item");
        if (genreItem) {
          const genreId = genreItem.dataset.genreId;
          const genreName = genreItem.textContent;
          window.location.href = `genre.html?id=${genreId}&name=${encodeURIComponent(
            genreName
          )}`;
        }
      });

      dropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        genresMenu.classList.toggle("active");
        dropdownBtn.classList.toggle("active");
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest(".genres-dropdown")) {
          genresMenu.classList.remove("active");
          dropdownBtn.classList.remove("active");
        }
      });
    } catch (error) {
      console.error("Failed to load genres dropdown:", error);
    }
  }
}

new GenrePage();
