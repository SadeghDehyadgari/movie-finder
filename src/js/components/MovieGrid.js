import { PathHelper } from "../utils/pathHelper.js";

export class MovieGrid {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.movies = [];
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.isGenreLayout = containerSelector === ".genre-movies-list";
    this.isMobile = window.innerWidth <= 768;
    this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.setupResizeListener();
  }

  setupResizeListener() {
    window.addEventListener("resize", () => {
      const wasMobile = this.isMobile;
      const wasTablet = this.isTablet;

      this.isMobile = window.innerWidth <= 768;
      this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

      if (
        (wasMobile !== this.isMobile || wasTablet !== this.isTablet) &&
        this.movies.length > 0
      ) {
        this.renderMovies(this.movies);
      }
    });
  }

  renderMovies(moviesData) {
    if (!this.container) return;

    this.movies = moviesData;
    this.container.innerHTML = "";

    if (this.movies.length === 0) {
      this.showEmptyState();
      return;
    }

    if (this.isGenreLayout) {
      this.renderGenreLayout();
    } else {
      this.renderGridLayout();
    }
  }

  renderGridLayout() {
    this.movies.forEach((movie) => {
      const movieCard = this.createMovieCard(movie);
      this.container.appendChild(movieCard);
    });
  }

  renderGenreLayout() {
    this.movies.forEach((movie) => {
      let movieCard;

      if (this.isMobile) {
        movieCard = this.createMobileGenreMovieCard(movie);
      } else if (this.isTablet) {
        movieCard = this.createTabletGenreMovieCard(movie);
      } else {
        movieCard = this.createDesktopGenreMovieCard(movie);
      }

      this.container.appendChild(movieCard);
    });
  }

  createMovieCard(movie) {
    const article = document.createElement("article");
    article.className = "movie-card";

    const posterUrl = movie.poster || this.generatePlaceholder();
    const yearDisplay = movie.year || "Unknown";
    const ratingDisplay = movie.rating !== "N/A" ? movie.rating : "N/A";
    const genresDisplay =
      movie.genres && movie.genres.length > 0
        ? movie.genres.join(" / ")
        : "Movie";

    const detailsUrl = PathHelper.getDetailsPath(movie.id);

    article.innerHTML = `
      <img 
        class="movie-poster" 
        src="${posterUrl}" 
        alt="${movie.title} Poster"
        loading="lazy"
      >
      <h3 class="movie-title">${movie.title}</h3>
      <div class="movie-genres">${yearDisplay} • ${genresDisplay}</div>
      <div class="movie-meta">
        <svg class="star-icon" width="16" height="16" viewBox="0 0 24 24">
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.897l-7.336 3.268 1.402-8.168L.132 9.21l8.2-1.192L12 .587z" fill="#f5c518"/>
        </svg>
        <span class="movie-rating">${ratingDisplay}</span>
        <a href="${detailsUrl}" class="view-info-link">View Info</a>
      </div>
    `;

    return article;
  }

  createMobileGenreMovieCard(movie) {
    const article = document.createElement("article");
    article.className = "genre-movie-card mobile-card";

    const posterUrl = movie.poster || this.generatePlaceholder();
    const yearDisplay = movie.year || "Unknown";
    const ratingDisplay = movie.rating !== "N/A" ? movie.rating : "N/A";
    const genresDisplay =
      movie.genres && movie.genres.length > 0
        ? movie.genres.slice(0, 2).join(", ")
        : "Movie";

    const detailsUrl = PathHelper.getDetailsPath(movie.id);

    article.innerHTML = `
      <div class="mobile-card-poster">
        <a href="${detailsUrl}">
          <img
            src="${posterUrl}"
            alt="${movie.title} Poster"
            loading="lazy"
          >
        </a>
      </div>
      <div class="mobile-card-content">
        <h3 class="mobile-card-title">
          <a href="${detailsUrl}">${movie.title}</a>
        </h3>
        <div class="mobile-card-meta">
          <span class="mobile-card-year">${yearDisplay}</span>
          <span class="meta-separator">•</span>
          <span class="mobile-card-rating">${ratingDisplay}</span>
          <svg class="star-icon" width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.897l-7.336 3.268 1.402-8.168L.132 9.21l8.2-1.192L12 .587z" fill="#f5c518"/>
          </svg>
        </div>
        <div class="mobile-card-genres">${genresDisplay}</div>
        <a href="${detailsUrl}" class="mobile-view-info">View Details</a>
      </div>
    `;

    return article;
  }

  createTabletGenreMovieCard(movie) {
    const article = document.createElement("article");
    article.className = "genre-movie-card tablet-card";

    const posterUrl = movie.poster || this.generatePlaceholder();
    const yearDisplay = movie.year || "Unknown";
    const ratingDisplay = movie.rating !== "N/A" ? movie.rating : "N/A";
    const genresDisplay =
      movie.genres && movie.genres.length > 0
        ? movie.genres
            .map(
              (genre) =>
                `<span class="movie-genre-tag tablet-tag">${genre}</span>`
            )
            .join("")
        : '<span class="movie-genre-tag tablet-tag">Movie</span>';

    const director = movie.director || "Not Available";
    const votes = movie.voteCount ? movie.voteCount.toLocaleString() : "0";

    const detailsUrl = PathHelper.getDetailsPath(movie.id);

    article.innerHTML = `
      <div class="tablet-poster-container">
        <a href="${detailsUrl}">
          <img
            src="${posterUrl}"
            alt="${movie.title} Poster"
            class="tablet-movie-poster"
            loading="lazy"
          >
        </a>
      </div>
      <div class="tablet-movie-details">
        <h3 class="tablet-movie-title">
          <a href="${detailsUrl}">${movie.title}</a>
        </h3>
        <div class="tablet-movie-meta">
          <span class="tablet-movie-year">${yearDisplay}</span>
          <span class="meta-separator">•</span>
          <span class="tablet-movie-rating">
            <svg class="star-icon" width="16" height="16" viewBox="0 0 24 24">
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.897l-7.336 3.268 1.402-8.168L.132 9.21l8.2-1.192L12 .587z" fill="#f5c518"/>
            </svg>
            ${ratingDisplay}
          </span>
        </div>
        <div class="tablet-genres-list">
          ${genresDisplay}
        </div>
        <div class="tablet-movie-info">
          <div class="tablet-info-item">
            <strong>Director:</strong> ${director}
          </div>
          <div class="tablet-info-item">
            <strong>Votes:</strong> ${votes}
          </div>
        </div>
        <a href="${detailsUrl}" class="tablet-view-details">View Details</a>
      </div>
    `;

    return article;
  }

  createDesktopGenreMovieCard(movie) {
    const article = document.createElement("article");
    article.className = "genre-movie-card";

    const posterUrl = movie.poster || this.generatePlaceholder();
    const yearDisplay = movie.year || "Unknown";
    const ratingDisplay = movie.rating !== "N/A" ? movie.rating : "N/A";
    const genresDisplay =
      movie.genres && movie.genres.length > 0
        ? movie.genres
            .map((genre) => `<span class="movie-genre-tag">${genre}</span>`)
            .join("")
        : '<span class="movie-genre-tag">Movie</span>';

    const director = movie.director || "Not Available";
    const stars =
      movie.cast && movie.cast.length > 0
        ? movie.cast.slice(0, 3).join(", ")
        : "Not Available";
    const votes = movie.voteCount ? movie.voteCount.toLocaleString() : "0";
    const runtime = movie.runtime ? this.formatRuntime(movie.runtime) : "N/A";
    const certification = movie.certification || "Not Rated";

    const detailsUrl = PathHelper.getDetailsPath(movie.id);

    article.innerHTML = `
      <div class="movie-poster-container">
        <a href="${detailsUrl}">
          <img
            src="${posterUrl}"
            alt="${movie.title} Poster"
            class="genre-movie-poster"
            loading="lazy"
          >
        </a>
      </div>
      <div class="movie-details">
        <h3 class="genre-movie-title">
          <a href="${detailsUrl}">${movie.title}</a>
        </h3>
        <div class="movie-meta-line">
          <span class="movie-year">${yearDisplay}</span>
          <span class="meta-separator">•</span>
          <span class="genre-movie-rating">${certification}</span>
          <span class="meta-separator">•</span>
          <span class="genre-movie-duration">${runtime}</span>
        </div>
        <div class="movie-genres-list">
          ${genresDisplay}
        </div>
        <p class="movie-description">
          ${movie.plot}
        </p>
        <div class="movie-credits">
          <div class="credit-line">
            <strong>Director:</strong> ${director}
          </div>
          <div class="credit-line">
            <strong>Stars:</strong> ${stars}
          </div>
        </div>
        <div class="genre-movie-votes"><strong>Votes:</strong> ${votes}</div>
      </div>
      <div class="genre-movie-rating-badge">
        <div class="star-rating">
          <svg
            class="star-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.897l-7.336 3.268 1.402-8.168L.132 9.21l8.2-1.192L12 .587z"
              fill="#f5c518"
            />
          </svg>
          <span class="genre-rating-score">${ratingDisplay}</span>
        </div>
        <div class="genre-rating-count">(${this.formatVoteCount(
          movie.voteCount
        )})</div>
      </div>
    `;

    return article;
  }

  formatRuntime(minutes) {
    if (!minutes || minutes === 0) return "N/A";
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

  showLoading() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading movies...</p>
      </div>
    `;
  }

  showError(message = "An error occurred while loading movies.") {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="error-state">
        <p>${message}</p>
        <button onclick="location.reload()">Try Again</button>
      </div>
    `;
  }

  showEmptyState(message = "No movies found.") {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state">
        <p>${message}</p>
      </div>
    `;
  }

  generatePlaceholder() {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiMxYjFiMWIiLz48dGV4dCB4PSIxNTAiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk2OTY5NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
  }
}
