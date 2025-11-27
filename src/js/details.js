class DetailsPage {
  constructor() {
    this.movieId = this.getMovieIdFromURL();
    this.init();
  }

  getMovieIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  async init() {
    if (!this.movieId) {
      this.showError(
        "Movie ID not found in URL. Please go back and try again."
      );
      return;
    }

    await this.loadMovieDetails();
    this.setupSearchHandler();
    this.setupGenresDropdown();
  }

  async loadMovieDetails() {
    try {
      this.showLoading();

      const { MovieDetailsService } = await import(
        "./api/movieDetailsService.js"
      );
      this.movieDetailsService = new MovieDetailsService();

      const movie = await this.movieDetailsService.getCompleteMovieDetails(
        this.movieId
      );

      this.hideLoading();
      this.renderMovieDetails(movie);
    } catch (error) {
      this.hideLoading();
      this.showError(
        `Failed to load movie details: ${error.message}. Please try again later.`
      );
    }
  }

  showLoading() {
    const mainContent = document.querySelector(".detail-main-content");
    if (mainContent) {
      let loadingOverlay = document.getElementById("loading-overlay");
      if (!loadingOverlay) {
        loadingOverlay = document.createElement("div");
        loadingOverlay.id = "loading-overlay";
        loadingOverlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        `;
        loadingOverlay.innerHTML = `
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 1rem; color: white;">Loading movie details...</p>
        `;
        document.body.appendChild(loadingOverlay);
      }
    }
  }

  hideLoading() {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }

  renderMovieDetails(movie) {
    document.title = `${movie.title} - Movie Finder`;

    this.safeSetText("movieTitle", movie.title);
    this.safeSetText("movieYear", movie.year);
    this.safeSetText("movieCertification", movie.certification);
    this.safeSetText(
      "movieRuntime",
      movie.runtime ? this.formatRuntime(movie.runtime) : "N/A"
    );
    this.safeSetText("movieRating", movie.rating);
    this.safeSetText(
      "movieVoteCount",
      `(${this.formatVoteCount(movie.voteCount)})`
    );

    const posterImg = document.getElementById("moviePoster");
    if (posterImg) {
      posterImg.src = movie.poster;
      posterImg.alt = `${movie.title} Poster`;
      posterImg.onerror = () => {
        posterImg.src = this.generatePlaceholder();
      };
    }

    this.safeSetText("moviePlot", movie.plot);

    this.renderGenres(movie.genres);
    this.renderCredits(movie);
    this.renderScenes(movie);
    this.renderCast(movie.cast);
  }

  safeSetText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }

  renderGenres(genres) {
    const genresContainer = document.getElementById("movieGenres");
    if (genresContainer) {
      genresContainer.innerHTML =
        genres && genres.length > 0
          ? genres
              .map(
                (genre) =>
                  `<span class="detail-genre-tag">${this.escapeHTML(
                    genre
                  )}</span>`
              )
              .join("")
          : '<span class="detail-genre-tag">Not Specified</span>';
    }
  }

  renderCredits(movie) {
    this.safeSetText("movieDirector", movie.director || "Not Available");

    const writers =
      movie.writers && movie.writers.length > 0
        ? movie.writers.join(", ")
        : "Not Available";
    this.safeSetText("movieWriters", writers);

    const stars =
      movie.stars && movie.stars.length > 0
        ? movie.stars.join(", ")
        : "Not Available";
    this.safeSetText("movieStars", stars);
  }

  renderScenes(movie) {
    const scenesContainer = document.getElementById("movieScenes");
    if (!scenesContainer) return;

    let sceneImages = [];

    if (movie.sceneImages && movie.sceneImages.length > 0) {
      sceneImages = movie.sceneImages.slice(0, 3);
    }

    while (sceneImages.length < 3) {
      sceneImages.push(this.generatePlaceholder());
    }

    scenesContainer.innerHTML = sceneImages
      .map(
        (imageUrl, index) => `
      <img 
        src="${imageUrl}" 
        alt="Scene ${index + 1}" 
        class="detail-scene-image"
        onerror="this.src='${this.generatePlaceholder()}'"
      />
    `
      )
      .join("");
  }

  renderCast(cast) {
    const castContainer = document.getElementById("movieCast");
    if (!castContainer) return;

    if (!cast || cast.length === 0) {
      castContainer.innerHTML =
        '<div class="no-cast">Cast information not available</div>';
      return;
    }

    castContainer.innerHTML = cast
      .map(
        (person) => `
      <div class="detail-cast-card">
        <img 
          src="${
            person.profile_path
              ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
              : this.generatePlaceholder()
          }" 
          alt="${person.name}" 
          class="detail-cast-photo"
          onerror="this.src='${this.generatePlaceholder()}'"
        />
        <div class="detail-cast-name">${this.escapeHTML(person.name)}</div>
        <div class="detail-cast-character">${this.escapeHTML(
          person.character || "Unknown Role"
        )}</div>
      </div>
    `
      )
      .join("");
  }

  formatRuntime(minutes) {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  formatVoteCount(voteCount) {
    if (!voteCount) return "0";
    if (voteCount >= 1000000) {
      return (voteCount / 1000000).toFixed(1) + "M";
    } else if (voteCount >= 1000) {
      return (voteCount / 1000).toFixed(1) + "K";
    }
    return voteCount.toString();
  }

  setupSearchHandler() {
    const searchInput = document.querySelector(".search-input");
    const searchButton = document.querySelector(".search-icon-btn");

    if (!searchInput || !searchButton) {
      return;
    }

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
          this.navigateToResults(query);
        }
      }
    });

    searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        this.hideSearchDropdown(searchDropdown);
        this.navigateToResults(query);
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
        this.navigateToDetails(movieId);
      }
    });
  }

  navigateToResults(query) {
    const currentPath = window.location.pathname;
    let resultsPath;

    if (currentPath.includes("/src/pages/")) {
      resultsPath = `results.html?search=${encodeURIComponent(query)}`;
    } else {
      resultsPath = `src/pages/results.html?search=${encodeURIComponent(
        query
      )}`;
    }

    window.location.href = resultsPath;
  }

  navigateToDetails(movieId) {
    const currentPath = window.location.pathname;
    let detailsPath;

    if (currentPath.includes("/src/pages/")) {
      detailsPath = `details.html?id=${movieId}`;
    } else {
      detailsPath = `src/pages/details.html?id=${movieId}`;
    }

    window.location.href = detailsPath;
  }

  async showSearchDropdown(query, dropdownContent) {
    try {
      const { TMDbService } = await import("./api/tmdbService.js");
      const tmdbService = new TMDbService();
      const result = await tmdbService.searchMovies(query, 1);
      this.renderSearchDropdown(
        result.movies.slice(0, 10),
        dropdownContent,
        tmdbService
      );
    } catch (error) {
      this.hideSearchDropdown(dropdownContent.parentElement);
    }
  }

  renderSearchDropdown(movies, dropdownContent, tmdbService) {
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
          <div class="dropdown-movie-card" data-movie-id="${
            movie.id
          }" role="option" tabindex="0">
            <img src="${movie.poster}" alt="${
            movie.title
          } poster" loading="lazy" onerror="this.src='${tmdbService.generatePlaceholder()}'">
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

  async setupGenresDropdown() {
    const genresMenu = document.querySelector(".genres-menu");
    const dropdownBtn = document.querySelector(".dropdown-btn");

    if (!genresMenu || !dropdownBtn) {
      return;
    }

    try {
      const { TMDbService } = await import("./api/tmdbService.js");
      const tmdbService = new TMDbService();
      const genres = await tmdbService.getGenres();

      genresMenu.innerHTML = genres
        .map(
          (genre) =>
            `<div class="genre-item" data-genre-id="${genre.id}">${genre.name}</div>`
        )
        .join("");

      genresMenu.addEventListener("click", (e) => {
        const genreItem = e.target.closest(".genre-item");
        if (genreItem) {
          const genreId = genreItem.dataset.genreId;
          const genreName = genreItem.textContent;
          this.navigateToGenre(genreId, genreName);
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

  navigateToGenre(genreId, genreName) {
    const currentPath = window.location.pathname;
    let genrePath;

    if (currentPath.includes("/src/pages/")) {
      genrePath = `genre.html?id=${genreId}&name=${encodeURIComponent(
        genreName
      )}`;
    } else {
      genrePath = `src/pages/genre.html?id=${genreId}&name=${encodeURIComponent(
        genreName
      )}`;
    }

    window.location.href = genrePath;
  }

  showError(message) {
    this.hideLoading();
    const mainContent = document.querySelector(".detail-main-content");
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <p>${message}</p>
          <button onclick="window.detailsPage.goHome()" style="margin-top: 1rem; padding: 8px 16px; background: var(--accent-color); color: #000; border: none; border-radius: 4px; cursor: pointer;">Go Home</button>
        </div>
      `;
    }
  }

  goHome() {
    const currentPath = window.location.pathname;
    let homePath;

    if (currentPath.includes("/src/pages/")) {
      homePath = "../../index.html";
    } else {
      homePath = "index.html";
    }

    window.location.href = homePath;
  }

  generatePlaceholder() {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiMxYjFiMWIiLz48dGV4dCB4PSIxNTAiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk2OTY5NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
  }

  escapeHTML(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

window.detailsPage = new DetailsPage();
