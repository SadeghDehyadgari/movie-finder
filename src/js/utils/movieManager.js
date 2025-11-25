import { TMDbService } from "../api/tmdbService.js"; // تغییر به TMDbService

export class MovieManager {
  constructor() {
    this.tmdbService = new TMDbService(); // تغییر به TMDbService
    this.currentQuery = "";
    this.currentPage = 1;
    this.totalResults = 0;
    this.currentMovies = [];
    this.searchHistory = [];
  }

  async searchMovies(query, page = 1) {
    try {
      this.currentQuery = query;
      this.currentPage = page;

      // Add to search history
      this.addToSearchHistory(query);

      const result = await this.tmdbService.searchMovies(query, page); // تغییر به tmdbService
      this.currentMovies = result.movies;
      this.totalResults = result.totalResults;

      return result;
    } catch (error) {
      // Clear current results on error
      this.currentMovies = [];
      this.totalResults = 0;
      throw error;
    }
  }

  async getMovieDetails(movieId) {
    try {
      return await this.tmdbService.getMovieDetails(movieId); // تغییر به tmdbService
    } catch (error) {
      throw error;
    }
  }

  // بقیه متدها بدون تغییر...
  addToSearchHistory(query) {
    if (query && !this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      // Keep only last 10 searches
      this.searchHistory = this.searchHistory.slice(0, 10);
    }
  }

  getSearchHistory() {
    return this.searchHistory;
  }

  getCurrentState() {
    return {
      query: this.currentQuery,
      page: this.currentPage,
      totalResults: this.totalResults,
      movies: this.currentMovies,
      searchHistory: this.searchHistory,
    };
  }

  clearSearch() {
    this.currentQuery = "";
    this.currentPage = 1;
    this.totalResults = 0;
    this.currentMovies = [];
  }

  hasCurrentSearch() {
    return this.currentQuery !== "" && this.currentMovies.length > 0;
  }
}
