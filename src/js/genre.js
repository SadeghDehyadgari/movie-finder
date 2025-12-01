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
    this.genres = [];

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
      this.showError("Genre not specified");
      return;
    }

    this.updatePageTitle();
    await this.loadGenres();
    await this.loadGenreMovies(1);
    this.setupPagination();
    this.setupEventListeners();
    this.setupGenresDropdown();
    this.renderPopularGenresCarousel();
  }

  updatePageTitle() {
    document.getElementById(
      "genreTitle"
    ).textContent = `${this.genreName} Movies`;
    document.title = `${this.genreName} Movies - Movie Finder`;
  }

  async loadGenres() {
    try {
      this.genres = await this.tmdbService.getGenres();
      this.renderGenreSidebar();
    } catch (error) {}
  }

  renderGenreSidebar() {
    const sidebar = document.querySelector(".genre-list-container");
    if (!sidebar) return;

    let currentGenreId = this.genreId;
    if (isNaN(this.genreId)) {
      currentGenreId = this.tmdbService.getGenreIdByName(this.genreName);
    }

    sidebar.innerHTML = this.genres
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

  renderPopularGenresCarousel() {
    const carousel = document.getElementById("popularGenresCarousel");
    if (!carousel) return;

    const popularGenres = this.genres.slice(0, 8);
    carousel.innerHTML = popularGenres
      .map((genre) => {
        const isActive = genre.id.toString() === this.genreId?.toString();
        return `
        <div class="genre-carousel-item ${isActive ? "active" : ""}" 
             data-genre-id="${genre.id}" 
             data-genre-name="${genre.name}">
          ${genre.name}
        </div>
      `;
      })
      .join("");

    this.setupCarouselClickHandlers();
  }

  setupCarouselClickHandlers() {
    const carouselItems = document.querySelectorAll(".genre-carousel-item");
    carouselItems.forEach((item) => {
      item.addEventListener("click", () => {
        const genreId = item.dataset.genreId;
        const genreName = item.dataset.genreName;

        carouselItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        this.genreId = genreId;
        this.genreName = genreName;
        this.updatePageTitle();
        this.loadGenreMovies(1);

        const sidebarItems = document.querySelectorAll(".genre-list-item");
        sidebarItems.forEach((i) => {
          i.classList.toggle("active", i.dataset.genreId === genreId);
        });

        window.history.pushState(
          {},
          "",
          `?id=${genreId}&name=${encodeURIComponent(genreName)}`
        );
      });
    });
  }

  setupGenreClickHandlers() {
    const genreItems = document.querySelectorAll(".genre-list-item");
    genreItems.forEach((item) => {
      item.addEventListener("click", () => {
        const genreId = item.dataset.genreId;
        const genreName = item.dataset.genreName;

        genreItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        const carouselItems = document.querySelectorAll(".genre-carousel-item");
        carouselItems.forEach((i) => {
          i.classList.toggle("active", i.dataset.genreId === genreId);
        });

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
      this.showLoading();
      this.currentPage = page;

      const result = await this.tmdbService.getMoviesByGenre(
        this.genreId,
        page
      );

      document.getElementById(
        "resultsCount"
      ).textContent = `${result.totalResults} titles`;
      document.getElementById("resultsCount").style.display = "inline";

      this.movieGrid.renderMovies(result.movies);
      this.pagination.update(result.totalResults, 20, page);
    } catch (error) {
      this.showError("Failed to load genre movies");
    }
  }

  setupEventListeners() {
    this.setupSearchHandler();
  }

  setupSearchHandler() {
    const searchInput = document.querySelector(".search-input");
    const searchButton = document.querySelector(".search-icon-btn");
    const searchDropdown = document.querySelector(".search-dropdown");
    const searchDropdownContent = searchDropdown.querySelector(
      ".search-dropdown-content"
    );

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
          window.location.href = `results.html?search=${encodeURIComponent(
            query
          )}`;
        }
      }
    });

    searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        this.hideSearchDropdown(searchDropdown);
        window.location.href = `results.html?search=${encodeURIComponent(
          query
        )}`;
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
               tabindex="0">
            <img src="${movie.poster}" alt="${
            movie.title
          } poster" loading="lazy">
            <div class="dropdown-movie-info">
              <h4>${movie.title}</h4>
              ${
                genresDisplay
                  ? `<div class="dropdown-movie-genres">${genresDisplay}</div>`
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
      this.loadGenreMovies(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  async setupGenresDropdown() {
    const genresMenu = document.querySelector(".genres-menu");
    const dropdownBtn = document.querySelector(".dropdown-btn");

    if (!genresMenu || !dropdownBtn) return;

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
    } catch (error) {}
  }

  showLoading() {
    const movieList = document.querySelector(".genre-movies-list");
    if (movieList) {
      movieList.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading movies...</p>
        </div>
      `;
    }
  }

  showError(message) {
    const movieList = document.querySelector(".genre-movies-list");
    if (movieList) {
      movieList.innerHTML = `
        <div class="error-state">
          <p>${message}</p>
          <button onclick="location.reload()">Try Again</button>
        </div>
      `;
    }
  }
}

new GenrePage();
