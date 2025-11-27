import CONFIG from "../config.js";

export class TMDbService {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
    this.apiKey = CONFIG.API.API_KEY;
    this.imageBaseURL = CONFIG.API.IMAGE_BASE_URL;
    this.genresMap = null;
    this.genresList = null;
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
      console.error("API Request failed:", error);
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
        this.genresList = [];
        data.genres.forEach((genre) => {
          this.genresMap[genre.id] = genre.name;
          this.genresList.push({ id: genre.id, name: genre.name });
        });
      } catch (error) {
        console.error("Failed to initialize genres:", error);
        this.genresMap = {};
        this.genresList = [];
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
      console.error("Failed to get popular movies:", error);
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
      console.error("Failed to get movie details:", error);
      throw error;
    }
  }

  async getMovieImages(movieId) {
    try {
      const data = await this.makeRequest(`movie/${movieId}/images`);
      const backdrops = data.backdrops || [];
      const posters = data.posters || [];

      const sceneImages = [];

      if (backdrops.length > 0) {
        sceneImages.push(
          ...backdrops
            .slice(0, 3)
            .map((backdrop) => `${this.imageBaseURL}w1280${backdrop.file_path}`)
        );
      }

      while (sceneImages.length < 3 && posters.length > 0) {
        sceneImages.push(`${this.imageBaseURL}w500${posters[0].file_path}`);
        posters.shift();
      }

      return sceneImages;
    } catch (error) {
      console.error("Failed to get movie images:", error);
      return [];
    }
  }

  async getMovieCertification(movieId) {
    try {
      const data = await this.makeRequest(`movie/${movieId}/release_dates`);

      const usReleases = data.results.find(
        (result) => result.iso_3166_1 === "US"
      );
      if (usReleases && usReleases.release_dates.length > 0) {
        const certification = usReleases.release_dates[0].certification;
        return certification || "Not Rated";
      }

      for (const result of data.results) {
        if (
          result.release_dates.length > 0 &&
          result.release_dates[0].certification
        ) {
          return result.release_dates[0].certification;
        }
      }

      return "Not Rated";
    } catch (error) {
      console.error(`Failed to get certification for movie ${movieId}:`, error);
      return "Not Rated";
    }
  }

  transformMovieData(
    data,
    useGenreIds = false,
    director = null,
    cast = [],
    certification = null
  ) {
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
      voteCount: data.vote_count || 0,
      director: director,
      cast: cast,
      runtime: data.runtime || null,
      certification: certification || "Not Rated",
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
      console.error("Failed to search movies:", error);
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
        sort_by: "vote_average.desc",
        "vote_count.gte": 50,
        "vote_average.gte": 5.0,
      });

      const filteredResults = data.results.filter(
        (movie) => movie.vote_count >= 50 && movie.vote_average >= 5.0
      );

      const movies = [];
      for (const movieData of filteredResults) {
        try {
          const [movieDetails, credits] = await Promise.all([
            this.makeRequest(`movie/${movieData.id}`, {
              language: "en-US",
              append_to_response: "release_dates",
            }),
            this.getMovieCredits(movieData.id),
          ]);

          const director =
            credits.crew.find((person) => person.job === "Director")?.name ||
            null;
          const cast = credits.cast.slice(0, 3).map((actor) => actor.name);

          const certification = this.extractCertification(
            movieDetails.release_dates
          );

          const movie = this.transformMovieData(
            { ...movieData, runtime: movieDetails.runtime },
            true,
            director,
            cast,
            certification
          );
          movies.push(movie);
        } catch (error) {
          console.error(`Failed to process movie ${movieData.id}:`, error);
          const movie = this.transformMovieData(movieData, true);
          movies.push(movie);
        }
      }

      return {
        movies: movies,
        totalResults: data.total_results,
        currentPage: data.page,
        totalPages: data.total_pages,
      };
    } catch (error) {
      console.error("Failed to get movies by genre:", error);
      throw error;
    }
  }

  extractCertification(releaseDatesData) {
    if (!releaseDatesData || !releaseDatesData.results) return "Not Rated";

    const usReleases = releaseDatesData.results.find(
      (result) => result.iso_3166_1 === "US"
    );
    if (usReleases && usReleases.release_dates.length > 0) {
      return usReleases.release_dates[0].certification || "Not Rated";
    }
    return "Not Rated";
  }

  async getMovieCredits(movieId) {
    try {
      const data = await this.makeRequest(`movie/${movieId}/credits`);
      return {
        cast: data.cast || [],
        crew: data.crew || [],
      };
    } catch (error) {
      console.error(`Failed to get credits for movie ${movieId}:`, error);
      return { cast: [], crew: [] };
    }
  }

  async getGenres() {
    try {
      await this.initializeGenres();
      return this.genresList;
    } catch (error) {
      console.error("Failed to get genres:", error);
      throw error;
    }
  }

  getGenreIdByName(genreName) {
    if (!this.genresMap) return null;

    for (const [id, name] of Object.entries(this.genresMap)) {
      if (name === genreName) return id;
    }
    return null;
  }
}
