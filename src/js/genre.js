import { MovieGrid } from "./components/MovieGrid.js";
import { Pagination } from "./components/Pagination.js";
import { TMDbService } from "./api/tmdbService.js";
import { SearchHandler } from "./components/SearchHandler.js";

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

    let currentGenreId = this.genreId;
    if (isNaN(this.genreId)) {
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

  setupSearchHandler() {
    const searchInput = document.querySelector(".search-input");
    const searchButton = document.querySelector(".search-icon-btn");

    if (!searchInput || !searchButton) {
      console.error("Search elements not found in genre page");
      return;
    }

    // ایجاد dropdown container اگر وجود ندارد
    let searchDropdown = document.querySelector(".search-dropdown");
    if (!searchDropdown) {
      searchDropdown = document.createElement("div");
      searchDropdown.className = "search-dropdown";
      searchDropdown.innerHTML =
        '<div class="search-dropdown-content" role="listbox"></div>';
      document.querySelector(".search-container").appendChild(searchDropdown);
    }

    const searchDropdownContent = searchDropdown.querySelector(
      ".search-dropdown-content"
    );

    // اضافه کردن event listeners برای جستجو
    this.setupSearchEvents(
      searchInput,
      searchButton,
      searchDropdown,
      searchDropdownContent
    );
  }

  setupSearchEvents(
    searchInput,
    searchButton,
    searchDropdown,
    searchDropdownContent
  ) {
    let searchDelayTimer = null;

    // Event listener برای تایپ کردن
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      if (this.searchDelayTimer) clearTimeout(this.searchDelayTimer);

      if (query.length >= 2) {
        this.searchDelayTimer = setTimeout(() => {
          this.showSearchDropdown(query, searchDropdownContent);
        }, 300);
      } else {
        this.hideSearchDropdown(searchDropdown);
      }
    });

    // Event listener برای دکمه Enter
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
          this.hideSearchDropdown(searchDropdown);
          // ریدایرکت به صفحه نتایج جستجو
          window.location.href = `results.html?search=${encodeURIComponent(
            query
          )}`;
        }
      }
    });

    // Event listener برای کلیک روی دکمه جستجو
    searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        this.hideSearchDropdown(searchDropdown);
        // ریدایرکت به صفحه نتایج جستجو
        window.location.href = `results.html?search=${encodeURIComponent(
          query
        )}`;
      }
    });

    // Event listener برای کلیک خارج از dropdown
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        this.hideSearchDropdown(searchDropdown);
      }
    });

    // Event listener برای کلیک روی آیتم‌های dropdown
    searchDropdownContent.addEventListener("click", (e) => {
      const movieCard = e.target.closest(".dropdown-movie-card");
      if (movieCard) {
        const movieId = movieCard.dataset.movieId;
        window.location.href = `details.html?id=${movieId}`;
      }
    });
  }

  async showSearchDropdown(query, dropdownContent) {
    try {
      const result = await this.tmdbService.searchMovies(query, 1);
      this.renderSearchDropdown(result.movies.slice(0, 10), dropdownContent);
    } catch (error) {
      console.error("Search dropdown error:", error);
      this.hideSearchDropdown(dropdownContent.parentElement);
    }
  }

  renderSearchDropdown(movies, dropdownContent) {
    if (!movies || movies.length === 0) {
      dropdownContent.innerHTML =
        '<div class="dropdown-empty">No results found</div>';
    } else {
      dropdownContent.innerHTML = movies
        .map((movie) => {
          const genresDisplay =
            movie.genres && movie.genres.length > 0
              ? movie.genres.slice(0, 3).join(" / ")
              : "";

          return `
          <div class="dropdown-movie-card" 
               data-movie-id="${movie.id}" 
               role="option" 
               tabindex="0"
               aria-label="${this.escapeHTML(movie.title)}">
            <img src="${movie.poster}" alt="${
            movie.title
          } poster" loading="lazy" onerror="this.src='${this.tmdbService.generatePlaceholder()}'">
            <div class="dropdown-movie-info">
              <h4>${this.escapeHTML(movie.title)}</h4>
              ${
                genresDisplay
                  ? `<div class="dropdown-movie-genres">${this.escapeHTML(
                      genresDisplay
                    )}</div>`
                  : ""
              }
            </div>
          </div>
        `;
        })
        .join("");
    }
    dropdownContent.parentElement.style.display = "block";
  }

  hideSearchDropdown(searchDropdown) {
    if (searchDropdown) {
      searchDropdown.style.display = "none";
    }
  }

  setupPagination() {
    this.pagination.onPageChange = (page) => {
      console.log("Page changed to:", page);
      this.loadGenreMovies(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
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

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

new GenrePage();
