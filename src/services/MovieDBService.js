import noImg from "../img/16643.jpg";

class MovieDBService {
  static instance = null;

  _apiBase = "https://api.themoviedb.org/3";
  _apiKey =
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMDkwZjdlNzU3ZmU4ZmUxMjM3MjkzN2YzMDFkNGNkZSIsIm5iZiI6MTc0MzA4OTg2Ny44MDMsInN1YiI6IjY3ZTU3MGNiNDIxZWI4YzMzMWJhNTgyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Ik5dzujXmMLJ5IZVL8xOWPO0ggVZwas_PrI5LFLc2tI";
  _basePage = 1;
  genres = [];
  sessionId = null;

  constructor() {
    if (!this.sessionId) {
      this.createGuestSession();
    }
  }

  static getInstance() {
    if (!MovieDBService.instance) {
      MovieDBService.instance = new MovieDBService();
    }
    return MovieDBService.instance;
  }

  async createGuestSession() {
    try {
      const response = await fetch(
        `${this._apiBase}/authentication/guest_session/new?api_key=${this._apiKey}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMDkwZjdlNzU3ZmU4ZmUxMjM3MjkzN2YzMDFkNGNkZSIsIm5iZiI6MTc0MzA4OTg2Ny44MDMsInN1YiI6IjY3ZTU3MGNiNDIxZWI4YzMzMWJhNTgyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Ik5dzujXmMLJ5IZVL8xOWPO0ggVZwas_PrI5LFLc2tI",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        this.sessionId = data.guest_session_id;
      } else {
        console.error(
          "Не удалось создать гостевую сессию:",
          data.status_message,
        );
      }
    } catch (error) {
      console.error("Ошибка при создании гостевой сессии:", error);
    }
  }

  async getResource(url, params = {}) {
    const queryParams = new URLSearchParams({
      language: "ru-RU",
      ...params,
    });

    const response = await fetch(`${this._apiBase}${url}?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${this._apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Could not fetch ${url}, status: ${response.status}`);
    }

    return await response.json();
  }

  async getAllMovies(page = this._basePage, params = {}) {
    if (this.genres.length === 0) {
      await this.getAllGenres();
    }

    const data = await this.getResource("/movie/now_playing", {
      page,
      ...params,
    });
    return {
      movies: data.results.map(this._transformMovie.bind(this)),
      totalPages: data.total_pages,
      currentPage: data.page,
      totalResults: data.total_results,
    };
  }

  async getMovieDetails(movieId, params = {}) {
    if (this.genres.length === 0) {
      await this.getAllGenres();
    }

    const res = await this.getResource(`/movie/${movieId}`, {
      append_to_response: "credits,similar",
      ...params,
    });
    return this._transformMovie(res);
  }

  async getAllGenres() {
    const res = await this.getResource("/genre/movie/list");
    this.genres = res.genres;
  }

  async searchMovies(query, page = this._basePage) {
    const data = await this.getResource("/search/movie", {
      query,
      page,
    });

    return {
      movies: data.results.map(this._transformMovie.bind(this)),
      totalPages: data.total_pages,
      currentPage: data.page,
      totalResults: data.total_results,
    };
  }

  async rateMovie(movieId, rating, guestSessionId) {
    try {
      const response = await fetch(
        `${this._apiBase}/movie/${movieId}/rating?api_key=${this._apiKey}&guest_session_id=${this.sessionId}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json;charset=utf-8",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMDkwZjdlNzU3ZmU4ZmUxMjM3MjkzN2YzMDFkNGNkZSIsIm5iZiI6MTc0MzA4OTg2Ny44MDMsInN1YiI6IjY3ZTU3MGNiNDIxZWI4YzMzMWJhNTgyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Ik5dzujXmMLJ5IZVL8xOWPO0ggVZwas_PrI5LFLc2tI",
          },
          body: JSON.stringify({
            value: rating,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка при оценке фильма:", errorData);
        throw new Error(
          `Could not rate movie ${movieId}, status: ${response.status}`,
        );
      }

      console.log("Фильм успешно оценен!");
    } catch (error) {
      console.error("Ошибка при оценке фильма:", error);
    }
  }

  async getRatedMovies(page = 1) {
    if (!this.sessionId) {
      console.error(
        "Сессия не создана. Пожалуйста, создайте сессию перед получением оцененных фильмов.",
      );
      return;
    }

    try {
      const response = await fetch(
        `${this._apiBase}/guest_session/${this.sessionId}/rated/movies?api_key=${this._apiKey}&page=${page}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMDkwZjdlNzU3ZmU4ZmUxMjM3MjkzN2YzMDFkNGNkZSIsIm5iZiI6MTc0MzA4OTg2Ny44MDMsInN1YiI6IjY3ZTU3MGNiNDIxZWI4YzMzMWJhNTgyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Ik5dzujXmMLJ5IZVL8xOWPO0ggVZwas_PrI5LFLc2tI",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "Список оцененных фильмов:",
        data.results.map(this._transformMovie.bind(this)),
      );

      console.log("Список оцененных фильмов:", data.results);
      return {
        movies: data.results.map(this._transformMovie.bind(this)),
        totalPages: data.total_pages,
        currentPage: data.page,
        totalResults: data.results.length,
      };
    } catch (error) {
      console.error("Ошибка при получении оцененных фильмов:", error);
    }
  }

  _transformGenre = (genresId) => {
    return genresId
      .map((id) => {
        const genre = this.genres.find((genre) => genre.id === id);
        return genre ? genre.name : null;
      })
      .filter((name) => name !== null);
  };

  _movieOverviewTrim = (overview) => {
    if (!overview) return "";

    const max = 120;
    if (overview.length <= max) {
      return overview;
    }
    let description = overview.slice(0, max);
    const lastSpace = description.lastIndexOf(" ");
    description = description.slice(0, lastSpace);
    return description + "...";
  };

  _transformMovie = (movie) => {
    return {
      id: movie.id,
      title: movie.title,
      overview: this._movieOverviewTrim(movie.overview),
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : noImg,
      rating: movie.vote_average,
      myRating: movie.rating,
      releaseDate: movie.release_date,
      genreIds: this._transformGenre(movie.genre_ids),
    };
  };
}

export default MovieDBService;
