import { Movie } from "@/types/movie";

const API_BASE_URL = "/api";

export async function fetchMovies(page: number = 1, mediaType: string = 'movie'): Promise<Movie[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/movies?page=${page}&mediaType=${mediaType}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${mediaType}s`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${mediaType}s:`, error);
    throw error;
  }
}

export async function searchMovies(query: string, mediaType?: string): Promise<Movie[]> {
  try {
    let url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`;
    if (mediaType) {
      url += `&mediaType=${mediaType}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to search");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching:", error);
    throw error;
  }
}

export async function getMediaDetails(id: number): Promise<Movie> {
  try {
    const response = await fetch(`${API_BASE_URL}/media/${id}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch details");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching details:", error);
    throw error;
  }
}

export async function getStreamUrl(tmdbId: number, mediaType: string = 'movie'): Promise<{ streamUrl: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/stream/${tmdbId}?mediaType=${mediaType}`);
    
    if (!response.ok) {
      throw new Error("Failed to get stream URL");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting stream URL:", error);
    throw error;
  }
}

export async function getFavorites(): Promise<Movie[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch favorites");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
}

export async function addToFavorites(mediaId: number, mediaType: string = 'movie'): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mediaId, mediaType }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to add to favorites");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
}

export async function removeFromFavorites(id: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error("Failed to remove from favorites");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
}

export function getImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path) {
    return '';  // Return empty string for null paths, we'll handle this in the components
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getYear(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).getFullYear().toString();
}
