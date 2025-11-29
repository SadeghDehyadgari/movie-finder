import { TMDbService } from "../api/tmdbService.js";

export class SearchHandler {
  constructor(movieGrid, pagination) {
    this.searchInput = document.querySelector(".search-input");
    this.searchButton = document.querySelector(".search-icon-btn");
    this.searchDropdown = document.querySelector(".search-dropdown-content");
    this.sectionTitle = document.getElementById("sectionTitle");
    this.resultsCount = document.getElementById("resultsCount");
    this.heroSlider = document.getElementById("heroSlider");
    this.mainContent = document.querySelector(".main-content");
    this.movieGrid = movieGrid;
    this.pagination = pagination;
    this.tmdbService = new TMDbService();
    this.currentQuery = "";
    this.isSearching = false;
    this.searchDelayTimer = null;
    this.searchHistory = [];
    this.isMobile = window.innerWidth < 768;
    this.init();
  }

  init() {
    if (!this.searchInput || !this.movieGrid || !this.pagination) return;
    this.setupMobileStyles();
    this.addEventListeners();
    this.loadPopularMovies();
  }

  setupMobileStyles() {
    if (this.isMobile && this.searchDropdown) {
      this.searchDropdown.parentElement.style.width = "100%";
      this.searchDropdown.parentElement.style.left = "0";
    }
  }

  addEventListeners() {
    this.searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      if (this.searchDelayTimer) clearTimeout(this.searchDelayTimer);

      const delay = this.isMobile ? 200 : 300;

      if (query.length >= 2) {
        this.searchDelayTimer = setTimeout(() => {
          this.showSearchDropdown(query);
        }, delay);
      } else if (query.length === 0) {
        this.hideSearchDropdown();
        this.clearSearch();
      }
    });

    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !this.isSearching) {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (query.length >= 2) {
          this.hideSearchDropdown();
          this.performSearch(query, 1);
        }
      }
    });

    if (this.searchButton) {
      this.searchButton.addEventListener("click", () => {
        const query = this.searchInput.value.trim();
        if (query.length >= 2 && !this.isSearching) {
          this.hideSearchDropdown();
          this.performSearch(query, 1);
        }
      });
    }

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        this.hideSearchDropdown();
      }
    });

    this.searchDropdown.addEventListener("click", (e) => {
      const movieCard = e.target.closest(".dropdown-movie-card");
      if (movieCard) {
        const movieId = movieCard.dataset.movieId;
        window.location.href = `src/pages/details.html?id=${movieId}`;
      }
    });

    this.searchDropdown.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const focusedCard = document.activeElement.closest(
          ".dropdown-movie-card"
        );
        if (focusedCard) {
          const movieId = focusedCard.dataset.movieId;
          window.location.href = `src/pages/details.html?id=${movieId}`;
        }
      }
    });

    this.pagination.onPageChange = (page) => {
      if (this.currentQuery) {
        this.performSearch(this.currentQuery, page);
      } else {
        this.loadPopularMovies(page);
      }
    };

    window.addEventListener("resize", () => {
      this.isMobile = window.innerWidth < 768;
      this.setupMobileStyles();
    });
  }

  async showSearchDropdown(query) {
    try {
      const result = await this.tmdbService.searchMovies(query, 1);
      this.renderSearchDropdown(result.movies.slice(0, this.isMobile ? 8 : 15));
    } catch (error) {
      this.hideSearchDropdown();
    }
  }

  renderSearchDropdown(movies) {
    if (!movies || movies.length === 0) {
      this.searchDropdown.innerHTML =
        '<div class="dropdown-empty">No results found</div>';
    } else {
      this.searchDropdown.innerHTML = movies
        .map((movie) => {
          const genresDisplay =
            movie.genres && movie.genres.length > 0
              ? movie.genres.slice(0, 2).join(" / ")
              : "";

          return `
          <div class="dropdown-movie-card ${
            this.isMobile ? "mobile-card" : ""
          }" 
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
    this.searchDropdown.parentElement.style.display = "block";
  }

  hideSearchDropdown() {
    this.searchDropdown.parentElement.style.display = "none";
  }

  async performSearch(query, page = 1) {
    if (this.isSearching) return;

    this.isSearching = true;
    this.currentQuery = query;
    this.addToSearchHistory(query);
    this.movieGrid.showLoading();

    if (this.heroSlider) {
      this.heroSlider.style.display = "none";
    }

    if (this.mainContent) {
      this.mainContent.style.marginTop = "0";
      this.mainContent.style.paddingTop = "90px";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const result = await this.tmdbService.searchMovies(query, page);
      this.handleSearchResults(result);
      this.updateSectionTitle(`Results for: ${query}`);
      if (this.resultsCount && result.totalResults !== undefined) {
        this.resultsCount.textContent = `${result.totalResults} titles`;
        this.resultsCount.style.display = "inline";
      }
    } catch (error) {
      this.movieGrid.showError("Search failed. Please try again.");
    } finally {
      this.isSearching = false;
    }
  }

  handleSearchResults(result) {
    if (result.movies && result.movies.length > 0) {
      this.movieGrid.renderMovies(result.movies);
      this.pagination.update(
        result.totalResults,
        this.movieGrid.itemsPerPage,
        this.pagination.currentPage
      );
    } else {
      this.movieGrid.showEmptyState("No movies found. Try a different search.");
      this.pagination.update(0, this.movieGrid.itemsPerPage, 1);
    }
  }

  updateSectionTitle(title) {
    if (this.sectionTitle) {
      this.sectionTitle.textContent = title;
    }
  }

  async loadPopularMovies(page = 1) {
    this.isSearching = true;
    this.movieGrid.showLoading();

    try {
      const result = await this.tmdbService.getPopularMovies(page);
      this.movieGrid.renderMovies(result.movies);
      this.pagination.update(
        result.totalResults,
        this.movieGrid.itemsPerPage,
        page
      );
      this.updateSectionTitle("");
      if (this.resultsCount) {
        this.resultsCount.style.display = "none";
      }
      if (this.heroSlider) {
        this.heroSlider.style.display = "block";
      }
      if (this.mainContent) {
        this.mainContent.style.marginTop = "";
        this.mainContent.style.paddingTop = "";
      }
    } catch (error) {
      this.movieGrid.showError("Failed to load movies. Please try again.");
    } finally {
      this.isSearching = false;
    }
  }

  clearSearch() {
    this.currentQuery = "";
    this.searchInput.value = "";
    this.pagination.currentPage = 1;
    this.hideSearchDropdown();

    if (this.heroSlider) {
      this.heroSlider.style.display = "block";
    }
    if (this.mainContent) {
      this.mainContent.style.marginTop = "";
      this.mainContent.style.paddingTop = "";
    }
    if (this.resultsCount) {
      this.resultsCount.style.display = "none";
    }

    this.loadPopularMovies();
  }

  addToSearchHistory(query) {
    if (query && !this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      this.searchHistory = this.searchHistory.slice(0, 10);
    }
  }

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}
