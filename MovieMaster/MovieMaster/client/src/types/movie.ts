export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: string;
  genres: string[];
  runtime: number;
  cast: string[];
  mediaType: string; // 'movie' or 'tv'
}

export interface MovieApiResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
