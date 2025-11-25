export class MovieGrid {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.movies = [];
    this.currentPage = 1;
    this.itemsPerPage = 20;

    if (this.container) {
      this.init();
    }
  }

  init() {}

  getMoviesForCurrentPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.movies.slice(startIndex, endIndex);
  }

  renderMovies(moviesData) {
    if (!this.container) return;

    this.movies = moviesData;
    this.currentPage = 1;
    this.renderCurrentPage();
  }

  renderCurrentPage() {
    if (!this.container) return;

    const currentPageMovies = this.getMoviesForCurrentPage();
    this.container.innerHTML = "";

    if (currentPageMovies.length === 0) {
      this.showEmptyState();
      return;
    }

    currentPageMovies.forEach((movie) => {
      const movieCard = this.createMovieCard(movie);
      this.container.appendChild(movieCard);
    });
  }

  goToPage(page) {
    this.currentPage = page;
    this.renderCurrentPage();
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

    article.innerHTML = `
      <img 
        class="movie-poster" 
        src="${posterUrl}" 
        alt="${movie.title} Poster"
        loading="lazy"
        onerror="this.src='${this.generatePlaceholder()}'"
      >
      <h3 class="movie-title">${this.escapeHTML(movie.title)}</h3>
      <div class="movie-genres">${yearDisplay} • ${this.escapeHTML(
      genresDisplay
    )}</div>
      <div class="movie-meta">
        <svg class="star-icon" width="16" height="16" viewBox="0 0 24 24" fill="#f5c518">
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.897l-7.336 3.268 1.402-8.168L.132 9.21l8.2-1.192L12 .587z"/>
        </svg>
        <span class="movie-rating">${ratingDisplay}</span>
        <a href="src/pages/details.html?id=${
          movie.id
        }" class="view-info-link">View Info</a>
      </div>
    `;

    return article;
  }

  showLoading() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 1rem;">Loading movies...</p>
      </div>
    `;
  }

  showError(message = "An error occurred while loading movies.") {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <p>${message}</p>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 8px 16px; background: var(--accent-color); color: #000; border: none; border-radius: 4px; cursor: pointer;">Try Again</button>
      </div>
    `;
  }

  showEmptyState(message = "No movies found.") {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <p>${message}</p>
      </div>
    `;
  }

  generatePlaceholder() {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiMxYjFiMWIiLz48dGV4dCB4PSIxNTAiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk2OTY5NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
  }

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}
