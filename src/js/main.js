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
  const dropdownBtn = genresDropdown?.querySelector(".dropdown-btn");

  if (genresDropdown && genresMenu && dropdownBtn) {
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

  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-icon-btn");

  if (searchInput && searchButton) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
          searchHandler.hideSearchDropdown();
          window.location.href = `src/pages/results.html?search=${encodeURIComponent(
            query
          )}`;
        }
      }
    });

    searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        searchHandler.hideSearchDropdown();
        window.location.href = `src/pages/results.html?search=${encodeURIComponent(
          query
        )}`;
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
        (genre) => `
      <div class="genre-item" data-genre-id="${genre.id}">${genre.name}</div>
    `
      )
      .join("");

    genresMenu.addEventListener("click", async (e) => {
      const genreItem = e.target.closest(".genre-item");
      if (genreItem) {
        const genreId = genreItem.dataset.genreId;
        const genreName = genreItem.textContent;
        window.location.href = `src/pages/genre.html?id=${genreId}&name=${encodeURIComponent(
          genreName
        )}`;
      }
    });
  } catch (error) {
    console.error("Failed to load genres:", error);
  }
}
