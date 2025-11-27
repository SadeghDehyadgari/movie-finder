export class PathHelper {
  static getDetailsPath(movieId) {
    const currentPath = window.location.pathname;

    if (currentPath.includes("/src/pages/")) {
      return `details.html?id=${movieId}`;
    } else if (
      currentPath.endsWith("index.html") ||
      currentPath.endsWith("/")
    ) {
      return `src/pages/details.html?id=${movieId}`;
    } else {
      return `details.html?id=${movieId}`;
    }
  }

  static getHomePath() {
    const currentPath = window.location.pathname;

    if (currentPath.includes("/src/pages/")) {
      return "../../index.html";
    } else {
      return "index.html";
    }
  }

  static getResultsPath(query) {
    const currentPath = window.location.pathname;

    if (currentPath.includes("/src/pages/")) {
      return `results.html?search=${encodeURIComponent(query)}`;
    } else {
      return `src/pages/results.html?search=${encodeURIComponent(query)}`;
    }
  }

  static getGenrePath(genreId, genreName) {
    const currentPath = window.location.pathname;

    if (currentPath.includes("/src/pages/")) {
      return `genre.html?id=${genreId}&name=${encodeURIComponent(genreName)}`;
    } else {
      return `src/pages/genre.html?id=${genreId}&name=${encodeURIComponent(
        genreName
      )}`;
    }
  }
}
