import CONFIG from "../config.js";

export class TMDbService {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
    this.apiKey = CONFIG.API.API_KEY;
    this.imageBaseURL = CONFIG.API.IMAGE_BASE_URL;
    this.genresMap = null;
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      url.searchParams.append("api_key", this.apiKey);

      Object.keys(params).forEach((key) => {
        url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async initializeGenres() {
    if (!this.genresMap) {
      try {
        const data = await this.makeRequest("genre/movie/list", {
          language: "en-US",
        });
        this.genresMap = {};
        data.genres.forEach((genre) => {
          this.genresMap[genre.id] = genre.name;
        });
      } catch (error) {
        this.genresMap = {};
      }
    }
  }

  async getPopularMovies(page = 1) {
    try {
      await this.initializeGenres();

      const data = await this.makeRequest("movie/popular", {
        language: "en-US",
        page: page,
      });

      const movies = data.results.slice(0, CONFIG.APP.ITEMS_PER_PAGE);

      return {
        movies: movies.map((movie) => this.transformMovieData(movie, true)),
        totalResults: data.total_results,
        currentPage: data.page,
        totalPages: data.total_pages,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMovieDetails(movieId) {
    try {
      const data = await this.makeRequest(`movie/${movieId}`, {
        language: "en-US",
      });

      return this.transformMovieData(data);
    } catch (error) {
      throw error;
    }
  }

  transformMovieData(data, useGenreIds = false) {
    let genres = [];

    if (data.genres && data.genres.length > 0) {
      genres = data.genres.map((genre) => genre.name);
    } else if (useGenreIds && data.genre_ids && data.genre_ids.length > 0) {
      genres = data.genre_ids
        .map((genreId) => this.genresMap[genreId] || "Unknown")
        .slice(0, 3);
    }

    if (genres.length === 0) {
      genres = ["Action", "Drama"];
    }

    return {
      id: data.id,
      title: data.title || data.original_title,
      year: data.release_date ? data.release_date.substring(0, 4) : "Unknown",
      type: "movie",
      poster: data.poster_path
        ? `${this.imageBaseURL}w500${data.poster_path}`
        : this.generatePlaceholder(),
      backdrop: data.backdrop_path
        ? `${this.imageBaseURL}w1280${data.backdrop_path}`
        : null,
      genres: genres,
      plot: data.overview || "No description available.",
      rating: data.vote_average ? data.vote_average.toFixed(1) : "N/A",
    };
  }

  async searchMovies(query, page = 1) {
    try {
      await this.initializeGenres();

      const data = await this.makeRequest("search/movie", {
        query: query,
        language: "en-US",
        page: page,
        include_adult: false,
      });

      return {
        movies: data.results.map((movie) =>
          this.transformMovieData(movie, true)
        ),
        totalResults: data.total_results,
        currentPage: data.page,
        totalPages: data.total_pages,
      };
    } catch (error) {
      throw error;
    }
  }

  generatePlaceholder() {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiMxYjFiMWIiLz48dGV4dCB4PSIxNTAiIHk9IjIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk2OTY5NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
  }

  async getMoviesByGenre(genreId, page = 1) {
    try {
      await this.initializeGenres();

      const data = await this.makeRequest("discover/movie", {
        with_genres: genreId,
        language: "en-US",
        page: page,
        sort_by: "popularity.desc",
      });

      return {
        movies: data.results.map((movie) =>
          this.transformMovieData(movie, true)
        ),
        totalResults: data.total_results,
        currentPage: data.page,
        totalPages: data.total_pages,
      };
    } catch (error) {
      throw error;
    }
  }

  async getGenres() {
    try {
      await this.initializeGenres();
      return Object.values(this.genresMap);
    } catch (error) {
      throw error;
    }
  }
}
