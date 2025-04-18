import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { insertMovieSchema, insertFavoriteSchema } from "@shared/schema";
import { z } from "zod";

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const api = express.Router();
  app.use("/api", api);

  // Get popular movies or TV shows
  api.get("/movies", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const mediaType = req.query.mediaType as string || 'movie';
      
      // Check if we have movies in our storage first
      const storedMovies = await storage.getMovies(page, 20, mediaType);
      
      if (storedMovies.length > 0) {
        return res.json(storedMovies);
      }
      
      // If not, fetch from TMDB API
      const endpoint = mediaType === 'tv' ? 'tv/popular' : 'movie/popular';
      const response = await fetch(
        `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${mediaType} from TMDB API`);
      }
      
      const data = await response.json() as any;
      
      // Process and store media
      const media = await Promise.all(
        data.results.map(async (item: any) => {
          // Get additional details
          const details = mediaType === 'tv' 
            ? await fetchTVDetails(item.id)
            : await fetchMovieDetails(item.id);
          
          // Convert to our schema format
          const newMedia = {
            tmdbId: item.id,
            title: mediaType === 'tv' ? item.name : item.title,
            overview: item.overview || '',
            posterPath: item.poster_path || null,
            backdropPath: item.backdrop_path || null,
            releaseDate: mediaType === 'tv' ? item.first_air_date || '' : item.release_date || '',
            voteAverage: (item.vote_average || 0).toString(),
            runtime: details?.runtime || 0,
            // Convert arrays to JSON strings
            genres: JSON.stringify(details?.genres?.map((g: any) => g.name) || []),
            cast: JSON.stringify(details?.credits?.cast?.slice(0, 10).map((c: any) => c.name) || []),
            mediaType: mediaType
          };
          
          try {
            // Validate with zod schema
            const validMedia = insertMovieSchema.parse(newMedia);
            
            // Check if media already exists
            const existingMedia = await storage.getMovieByTmdbId(item.id, mediaType);
            if (existingMedia) {
              return existingMedia;
            }
            
            // Store media in our storage
            const storedMedia = await storage.createMovie(validMedia);
            return storedMedia;
          } catch (error) {
            console.error("Error validating media:", error);
            return null;
          }
        })
      );
      
      // Filter out any null values from failed validations
      const validMedia = media.filter(item => item !== null);
      
      return res.json(validMedia);
    } catch (error) {
      console.error(`Error fetching media:`, error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // Search movies and TV shows
  api.get("/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const mediaType = req.query.mediaType as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      // Check our storage first
      const storedResults = await storage.searchMovies(query, mediaType);
      
      if (storedResults.length > 0) {
        return res.json(storedResults);
      }
      
      // If no results in storage, search TMDB
      // Choose endpoint based on mediaType, default is multi search (movies + TV)
      const endpoint = mediaType === 'tv' ? 'search/tv' : 
                      mediaType === 'movie' ? 'search/movie' : 
                      'search/multi';
                      
      const response = await fetch(
        `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to search from TMDB API");
      }
      
      const data = await response.json() as any;
      
      // Process and store search results
      const results = await Promise.all(
        data.results
          // Filter out people and other non-movie/tv results in multi search
          .filter((item: any) => {
            if (endpoint === 'search/multi') {
              return item.media_type === 'movie' || item.media_type === 'tv';
            }
            return true;
          })
          .map(async (item: any) => {
            try {
              // Determine the media type
              const itemMediaType = endpoint === 'search/multi' ? 
                                  item.media_type : 
                                  (endpoint === 'search/tv' ? 'tv' : 'movie');
              
              // Get additional details
              const details = itemMediaType === 'tv' 
                ? await fetchTVDetails(item.id)
                : await fetchMovieDetails(item.id);
              
              // Convert to our schema format
              const newMedia = {
                tmdbId: item.id,
                title: itemMediaType === 'tv' ? item.name : item.title,
                overview: item.overview || '',
                posterPath: item.poster_path || null,
                backdropPath: item.backdrop_path || null,
                releaseDate: itemMediaType === 'tv' ? item.first_air_date || '' : item.release_date || '',
                voteAverage: (item.vote_average || 0).toString(),
                runtime: details?.runtime || 0,
                // Convert arrays to JSON strings
                genres: JSON.stringify(details?.genres?.map((g: any) => g.name) || []),
                cast: JSON.stringify(details?.credits?.cast?.slice(0, 10).map((c: any) => c.name) || []),
                mediaType: itemMediaType
              };
              
              // Validate with zod schema
              const validMedia = insertMovieSchema.parse(newMedia);
              
              // Check if media already exists
              const existingMedia = await storage.getMovieByTmdbId(item.id, itemMediaType);
              if (existingMedia) {
                return existingMedia;
              }
              
              // Store media in our storage
              const storedMedia = await storage.createMovie(validMedia);
              return storedMedia;
            } catch (error) {
              console.error("Error processing search result:", error);
              return null;
            }
          })
      );
      
      // Filter out any null values and sort by vote average
      const validResults = results
        .filter(item => item !== null)
        .sort((a, b) => 
          a && b ? parseFloat(b.voteAverage) - parseFloat(a.voteAverage) : 0
        );
      
      return res.json(validResults);
    } catch (error) {
      console.error("Error searching media:", error);
      res.status(500).json({ message: "Failed to search media" });
    }
  });

  // Get media details
  api.get("/media/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check our storage
      const storedMedia = await storage.getMovie(id);
      
      if (storedMedia) {
        return res.json(storedMedia);
      }
      
      return res.status(404).json({ message: "Media not found" });
    } catch (error) {
      console.error("Error fetching media details:", error);
      res.status(500).json({ message: "Failed to fetch media details" });
    }
  });

  // Get stream URL (VIDSRC)
  api.get("/stream/:tmdbId", async (req: Request, res: Response) => {
    try {
      const tmdbId = parseInt(req.params.tmdbId);
      const mediaType = req.query.mediaType as string || 'movie';
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // VIDSRC uses simple URLs to embed videos
      const streamUrl = `https://vidsrc.to/embed/${mediaType}/${tmdbId}`;
      
      return res.json({ streamUrl });
    } catch (error) {
      console.error("Error generating stream URL:", error);
      res.status(500).json({ message: "Failed to generate stream URL" });
    }
  });
  
  // Favorites routes
  api.post("/favorites", async (req: Request, res: Response) => {
    try {
      const { mediaId, mediaType } = req.body;
      
      if (!mediaId || !mediaType) {
        return res.status(400).json({ message: "MediaId and mediaType are required" });
      }
      
      // Validate with zod schema
      const validFavorite = insertFavoriteSchema.parse({ mediaId, mediaType });
      
      // Add to favorites
      const favorite = await storage.addToFavorites(mediaId, mediaType);
      
      return res.json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });
  
  api.delete("/favorites/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Remove from favorites
      const success = await storage.removeFromFavorites(id);
      
      if (success) {
        return res.json({ message: "Removed from favorites" });
      } else {
        return res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });
  
  api.get("/favorites", async (req: Request, res: Response) => {
    try {
      // Get favorites
      const favorites = await storage.getFavorites();
      
      return res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to fetch movie details from TMDB
interface MediaDetails {
  id: number;
  runtime?: number;
  genres?: Array<{id: number, name: string}>;
  credits?: {
    cast?: Array<{id: number, name: string, character: string}>;
  };
  [key: string]: any; // Allow other properties
}

async function fetchMovieDetails(movieId: number): Promise<MediaDetails | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    );
    
    if (!response.ok) {
      console.error("Failed to fetch movie details from TMDB API");
      return null;
    }
    
    return await response.json() as MediaDetails;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

// Helper function to fetch TV show details from TMDB
async function fetchTVDetails(tvId: number): Promise<MediaDetails | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    );
    
    if (!response.ok) {
      console.error("Failed to fetch TV details from TMDB API");
      return null;
    }
    
    const data = await response.json() as MediaDetails;
    
    // For consistency with movies, convert episode_run_time to runtime
    if (data.episode_run_time && data.episode_run_time.length > 0) {
      data.runtime = data.episode_run_time[0];
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching TV details:", error);
    return null;
  }
}