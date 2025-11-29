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
  const isMobile = window.innerWidth < 768;

  if (genresDropdown && genresMenu && dropdownBtn) {
    await initializeGenres();

    const handleDropdownToggle = (e) => {
      e.stopPropagation();
      genresMenu.classList.toggle("active");
      dropdownBtn.classList.toggle("active");
    };

    if (isMobile) {
      dropdownBtn.addEventListener("touchstart", handleDropdownToggle);
    } else {
      dropdownBtn.addEventListener("click", handleDropdownToggle);
    }

    document.addEventListener(isMobile ? "touchstart" : "click", (e) => {
      if (!e.target.closest(".genres-dropdown")) {
        genresMenu.classList.remove("active");
        dropdownBtn.classList.remove("active");
      }
    });
  }

  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-icon-btn");

  if (searchInput && searchButton) {
    const handleSearch = () => {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        searchHandler.hideSearchDropdown();
        window.location.href = `./src/pages/results.html?search=${encodeURIComponent(
          query
        )}`;
      }
    };

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    });

    if (isMobile) {
      searchButton.addEventListener("touchstart", handleSearch);
    } else {
      searchButton.addEventListener("click", handleSearch);
    }
  }

  setupMobileOptimizations();
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

    const handleGenreClick = async (e) => {
      const genreItem = e.target.closest(".genre-item");
      if (genreItem) {
        const genreId = genreItem.dataset.genreId;
        const genreName = genreItem.textContent;
        window.location.href = `./src/pages/genre.html?id=${genreId}&name=${encodeURIComponent(
          genreName
        )}`;
      }
    };

    genresMenu.addEventListener("click", handleGenreClick);
  } catch (error) {
    console.error("Failed to load genres:", error);
  }
}

function setupMobileOptimizations() {
  let touchStartY = 0;
  let isRefreshing = false;

  if (window.innerWidth < 768) {
    document.addEventListener("touchstart", (e) => {
      touchStartY = e.touches[0].clientY;
    });

    document.addEventListener("touchmove", (e) => {
      if (!touchStartY) return;

      const touchY = e.touches[0].clientY;
      const diff = touchY - touchStartY;

      if (diff > 100 && window.scrollY === 0 && !isRefreshing) {
        isRefreshing = true;
        showPullToRefresh();
      }
    });

    document.addEventListener("touchend", () => {
      if (isRefreshing) {
        setTimeout(() => {
          hidePullToRefresh();
          location.reload();
        }, 1000);
      }
      touchStartY = 0;
    });
  }

  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  });
}

function showPullToRefresh() {
  const refreshElement = document.createElement("div");
  refreshElement.id = "pull-to-refresh";
  refreshElement.innerHTML = `
    <div style="text-align: center; padding: 1rem; background: var(--bg-color);">
      <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 0.5rem; font-size: 0.9rem;">Refreshing...</p>
    </div>
  `;
  document.body.insertBefore(refreshElement, document.body.firstChild);
}

function hidePullToRefresh() {
  const refreshElement = document.getElementById("pull-to-refresh");
  if (refreshElement) {
    refreshElement.remove();
  }
}
