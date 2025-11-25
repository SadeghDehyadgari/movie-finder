import { HeroSlider } from "./components/HeroSlider.js";
import { MovieGrid } from "./components/MovieGrid.js";
import { Pagination } from "./components/Pagination.js";
import { SearchHandler } from "./components/SearchHandler.js";

const heroSlider = new HeroSlider(".hero-slider");
const movieGrid = new MovieGrid(".movie-grid");
const pagination = new Pagination(".pagination");
const searchHandler = new SearchHandler(movieGrid, pagination);

document.addEventListener("DOMContentLoaded", async () => {
  const genresDropdown = document.querySelector(".genres-dropdown");
  const genresMenu = document.querySelector(".genres-menu");
  const dropdownBtn = genresDropdown.querySelector(".dropdown-btn");

  if (genresDropdown && genresMenu) {
    await initializeGenres();

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
  }

  const clearSearchBtn = document.getElementById("clearSearchBtn");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchHandler.clearSearch();
      clearSearchBtn.style.display = "none";
    });
  }
});

async function initializeGenres() {
  const tmdbService = new (await import("./api/tmdbService.js")).TMDbService();
  const genresMenu = document.querySelector(".genres-menu");

  try {
    const genres = await tmdbService.getGenres();
    genresMenu.innerHTML = genres
      .map(
        (genre, index) => `
      <div class="genre-item" data-genre-id="${index + 1}">${genre}</div>
    `
      )
      .join("");

    genresMenu.addEventListener("click", async (e) => {
      const genreItem = e.target.closest(".genre-item");
      if (genreItem) {
        const genreId = genreItem.dataset.genreId;
        const genreName = genreItem.textContent;
        const tmdbService = new (
          await import("./api/tmdbService.js")
        ).TMDbService();
        const result = await tmdbService.getMoviesByGenre(genreId);
        movieGrid.renderMovies(result.movies);
        pagination.update(result.totalResults, movieGrid.itemsPerPage, 1);
        document.getElementById(
          "sectionTitle"
        ).textContent = `${genreName} Movies`;
        document.getElementById("clearSearchBtn").style.display = "block";

        const heroSlider = document.getElementById("heroSlider");
        if (heroSlider) {
          heroSlider.style.display = "none";
        }
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
          mainContent.style.marginTop = "0";
          mainContent.style.paddingTop = "90px";
        }

        genresMenu.classList.remove("active");
        document.querySelector(".dropdown-btn").classList.remove("active");
      }
    });
  } catch (error) {
    console.error("Failed to load genres:", error);
  }
}
