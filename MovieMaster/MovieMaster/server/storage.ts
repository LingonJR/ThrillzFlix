import { 
  movies, 
  type Movie, 
  type InsertMovie, 
  users, 
  type User, 
  type InsertUser,
  favorites,
  type Favorite,
  type InsertFavorite
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Movie methods
  getMovies(page: number, limit: number, mediaType?: string): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  getMovieByTmdbId(tmdbId: number, mediaType?: string): Promise<Movie | undefined>;
  searchMovies(query: string, mediaType?: string): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  // Favorites methods
  addToFavorites(mediaId: number, mediaType: string): Promise<Favorite>;
  removeFromFavorites(id: number): Promise<boolean>;
  getFavorites(): Promise<Movie[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  private favorites: Map<number, Favorite>;
  private userCurrentId: number;
  private movieCurrentId: number;
  private favoriteCurrentId: number;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.favorites = new Map();
    this.userCurrentId = 1;
    this.movieCurrentId = 1;
    this.favoriteCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Movie methods
  async getMovies(page: number = 1, limit: number = 20, mediaType?: string): Promise<Movie[]> {
    const start = (page - 1) * limit;
    const end = start + limit;
    const allMovies = Array.from(this.movies.values());
    
    // Filter by media type if provided
    const filteredMovies = mediaType 
      ? allMovies.filter(movie => movie.mediaType === mediaType)
      : allMovies;
      
    return filteredMovies.slice(start, end);
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getMovieByTmdbId(tmdbId: number, mediaType = 'movie'): Promise<Movie | undefined> {
    return Array.from(this.movies.values()).find(
      (movie) => movie.tmdbId === tmdbId && movie.mediaType === mediaType,
    );
  }

  async searchMovies(query: string, mediaType?: string): Promise<Movie[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.movies.values())
      .filter(movie => {
        // Filter by media type if provided
        if (mediaType && movie.mediaType !== mediaType) {
          return false;
        }
        
        // Parse JSON string for genres if it exists
        let genres: string[] = [];
        if (movie.genres) {
          try {
            genres = JSON.parse(movie.genres);
          } catch (e) {
            // If parsing fails, keep as empty array
            genres = [];
          }
        }
        
        return movie.title.toLowerCase().includes(searchTerm) || 
          genres.some(genre => genre.toLowerCase().includes(searchTerm));
      })
      // Sort by vote average (popularity) in descending order
      .sort((a, b) => {
        const voteA = parseFloat(a.voteAverage || '0');
        const voteB = parseFloat(b.voteAverage || '0');
        return voteB - voteA;
      });
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.movieCurrentId++;
    // Ensure mediaType is set, default to 'movie' if not provided
    const movie: Movie = { 
      ...insertMovie, 
      id, 
      mediaType: insertMovie.mediaType || 'movie',
      overview: insertMovie.overview || '',
      posterPath: insertMovie.posterPath || null,
      backdropPath: insertMovie.backdropPath || null,
      releaseDate: insertMovie.releaseDate || '',
      voteAverage: insertMovie.voteAverage || '0',
      genres: insertMovie.genres || '[]',
      cast: insertMovie.cast || '[]',
      runtime: insertMovie.runtime || 0
    };
    this.movies.set(id, movie);
    return movie;
  }
  
  // Favorites methods
  async addToFavorites(mediaId: number, mediaType: string): Promise<Favorite> {
    const id = this.favoriteCurrentId++;
    const favorite: Favorite = {
      id,
      mediaId,
      mediaType,
      createdAt: new Date()
    };
    this.favorites.set(id, favorite);
    return favorite;
  }
  
  async removeFromFavorites(id: number): Promise<boolean> {
    return this.favorites.delete(id);
  }
  
  async getFavorites(): Promise<Movie[]> {
    // Get all the favorited items
    const favoriteItems = Array.from(this.favorites.values());
    
    // Get the corresponding movie objects
    const favoriteMovies = favoriteItems.map(favorite => {
      const movie = Array.from(this.movies.values()).find(
        movie => movie.id === favorite.mediaId
      );
      return movie;
    }).filter(Boolean) as Movie[];
    
    return favoriteMovies;
  }
}

export const storage = new MemStorage();
