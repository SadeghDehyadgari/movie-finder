import { TMDbService } from "../api/tmdbService.js";

export class HeroSlider {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.tmdbService = new TMDbService();
    this.slides = this.container
      ? this.container.querySelectorAll(".slide")
      : [];
    this.bullets = this.container
      ? this.container.querySelectorAll(".bullet")
      : [];
    this.currentSlide = 0;
    this.interval = null;

    this.init();
  }

  async init() {
    if (this.slides.length === 0) return;

    try {
      await this.loadSlideData();
    } catch (error) {
      this.useDefaultSlides();
    }

    this.addEventListeners();
    this.startAutoSlide();
  }

  async loadSlideData() {
    try {
      const popularMovies = await this.tmdbService.getPopularMovies();
      this.updateSlidesWithData(popularMovies.movies.slice(0, 5));
    } catch (error) {
      this.useDefaultSlides();
    }
  }

  updateSlidesWithData(movies) {
    this.slides.forEach((slide, index) => {
      const movie = movies[index];
      if (movie) {
        this.updateSlideContent(slide, movie);
        this.updateSlideBackground(slide, movie);
      }
    });
  }

  updateSlideBackground(slide, movie) {
    if (movie.backdrop) {
      slide.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8)), url("${movie.backdrop}")`;
    } else if (movie.poster) {
      slide.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8)), url("${movie.poster}")`;
    }
  }

  updateSlideContent(slide, movie) {
    const content = slide.querySelector(".slide-content");
    if (!content) return;

    const title = movie.title || "Unknown Movie";
    const genres =
      movie.genres && movie.genres.length > 0
        ? movie.genres.slice(0, 3)
        : ["Action", "Drama"];
    const plot = movie.plot || "An exciting adventure awaits...";
    const rating = movie.rating || "8.0";
    const year = movie.year || "2023";

    content.innerHTML = `
      <h1 class="movie-title-hero">${this.escapeHTML(title)}</h1>
      <div class="movie-genres-hero">
        ${genres
          .map(
            (genre) =>
              `<span class="genre-pill">${this.escapeHTML(genre)}</span>`
          )
          .join("")}
      </div>
      <p class="movie-description">
        ${this.escapeHTML(plot)}
      </p>
      <div class="theater-badge">
        ${year} • ⭐ ${rating}/10
      </div>
    `;
  }

  useDefaultSlides() {}

  addEventListeners() {
    this.bullets.forEach((bullet, index) => {
      bullet.addEventListener("click", () => {
        this.stopAutoSlide();
        this.goToSlide(index);
        this.startAutoSlide();
      });
    });
  }

  goToSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= this.slides.length) return;

    this.slides[this.currentSlide].classList.remove("active");
    this.bullets[this.currentSlide].classList.remove("active");

    this.currentSlide = slideIndex;
    this.slides[this.currentSlide].classList.add("active");
    this.bullets[this.currentSlide].classList.add("active");
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.interval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}
