import { MovieGrid } from "./components/MovieGrid.js";
import { Pagination } from "./components/Pagination.js";
import { TMDbService } from "./api/tmdbService.js";

class ResultsPage {
  constructor() {
    this.movieGrid = new MovieGrid(".movie-grid");
    this.pagination = new Pagination(".pagination");
    this.tmdbService = new TMDbService();
    this.searchQuery = this.getSearchQueryFromURL();
    this.currentPage = 1;
    this.init();
  }

  getSearchQueryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("search") || "";
  }

  async init() {
    if (!this.searchQuery) {
      console.error("No search query found in URL");
      this.showError("No search query specified");
      return;
    }
    this.updatePageTitle();
    await this.loadSearchResults(1);
    this.setupPagination();
    this.setupSearchHandler();
    this.setupGenresDropdown();
  }

  updatePageTitle() {
    document.getElementById(
      "sectionTitle"
    ).textContent = `Results for: ${this.searchQuery}`;
    document.title = `Search: ${this.searchQuery} - Movie Finder`;
  }

  async loadSearchResults(page = 1) {
    try {
      this.showLoading();
      this.currentPage = page;

      const result = await this.tmdbService.searchMovies(
        this.searchQuery,
        page
      );

      document.getElementById(
        "resultsCount"
      ).textContent = `${result.totalResults} titles`;
      document.getElementById("resultsCount").style.display = "inline";

      this.movieGrid.renderMovies(result.movies);
      this.pagination.update(result.totalResults, 20, page);
    } catch (error) {
      console.error("Failed to load search results:", error);
      this.showError("Failed to load search results: " + error.message);
    }
  }

  setupSearchHandler() {
    const searchInput = document.querySelector(".search-input");
    const searchButton = document.querySelector(".search-icon-btn");
    const searchDropdown = document.querySelector(".search-dropdown");
    const searchDropdownContent = document.querySelector(
      ".search-dropdown-content"
    );

    if (!searchInput || !searchButton || !searchDropdown) {
      console.error("Search elements not found in results page");
      return;
    }

    searchInput.value = this.searchQuery;

    let searchDelayTimer = null;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      if (searchDelayTimer) clearTimeout(searchDelayTimer);

      if (query.length >= 2) {
        searchDelayTimer = setTimeout(() => {
          this.showSearchDropdown(query, searchDropdownContent);
        }, 300);
      } else {
        this.hideSearchDropdown(searchDropdown);
      }
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
          this.hideSearchDropdown(searchDropdown);
          if (query !== this.searchQuery) {
            window.location.href = `results.html?search=${encodeURIComponent(
              query
            )}`;
          }
        }
      }
    });

    searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        this.hideSearchDropdown(searchDropdown);
        if (query !== this.searchQuery) {
          window.location.href = `results.html?search=${encodeURIComponent(
            query
          )}`;
        }
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        this.hideSearchDropdown(searchDropdown);
      }
    });

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
      this.loadSearchResults(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
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

  showLoading() {
    const movieGrid = document.querySelector(".movie-grid");
    if (movieGrid) {
      movieGrid.innerHTML = `
        <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 1rem;">Loading search results...</p>
        </div>
      `;
    }
  }

  showError(message) {
    const movieGrid = document.querySelector(".movie-grid");
    if (movieGrid) {
      movieGrid.innerHTML = `
        <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
          <p>${message}</p>
          <button onclick="location.reload()" style="margin-top: 1rem; padding: 8px 16px; background: var(--accent-color); color: #000; border: none; border-radius: 4px; cursor: pointer;">Try Again</button>
        </div>
      `;
    }
  }

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

new ResultsPage();
