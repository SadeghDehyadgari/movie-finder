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

  if (genresDropdown && genresMenu) {
    await initializeGenres();

    const dropdownBtn = genresDropdown.querySelector(".dropdown-btn");
    dropdownBtn.addEventListener("click", () => {
      genresMenu.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".genres-dropdown")) {
        genresMenu.classList.remove("active");
      }
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
        genresMenu.classList.remove("active");
      }
    });
  } catch (error) {
    console.error("Failed to load genres:", error);
  }
}
