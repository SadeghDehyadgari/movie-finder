import { TMDbService } from "./tmdbService.js";

export class MovieDetailsService {
  constructor() {
    this.tmdbService = new TMDbService();
  }

  async getCompleteMovieDetails(movieId) {
    try {
      const [movie, credits, certification, sceneImages] = await Promise.all([
        this.tmdbService.getMovieDetails(movieId),
        this.tmdbService.getMovieCredits(movieId),
        this.getMovieCertification(movieId),
        this.tmdbService.getMovieImages(movieId),
      ]);

      const completeMovie = {
        ...movie,
        certification: certification,
        director:
          credits.crew.find((person) => person.job === "Director")?.name ||
          "Not Available",
        writers: credits.crew
          .filter(
            (person) =>
              person.job === "Writer" || person.department === "Writing"
          )
          .map((writer) => writer.name)
          .slice(0, 3),
        stars: credits.cast.slice(0, 5).map((star) => star.name),
        cast: credits.cast.slice(0, 6),
        sceneImages: sceneImages,
      };

      return completeMovie;
    } catch (error) {
      throw error;
    }
  }

  async getMovieCertification(movieId) {
    try {
      const data = await this.tmdbService.makeRequest(
        `movie/${movieId}/release_dates`
      );

      const usReleases = data.results.find(
        (result) => result.iso_3166_1 === "US"
      );
      if (usReleases && usReleases.release_dates.length > 0) {
        return usReleases.release_dates[0].certification || "Not Rated";
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
      return "Not Rated";
    }
  }
}
