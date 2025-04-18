import React, { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie";
import { getImageUrl, getStreamUrl, addToFavorites, removeFromFavorites, getFavorites } from "@/lib/api";
import { X, Play, Heart, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, isOpen, onClose }) => {
  const [isWatching, setIsWatching] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isRemovingFavorite, setIsRemovingFavorite] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const queryClient = useQueryClient();
  
  // Check if movie is in favorites
  const { data: favorites = [] } = useQuery<Movie[]>({
    queryKey: ['/api/favorites'],
    queryFn: getFavorites,
  });
  
  useEffect(() => {
    if (movie && favorites.length > 0) {
      const found = favorites.some(fav => fav.tmdbId === movie.tmdbId && fav.mediaType === movie.mediaType);
      setIsFavorite(found);
    } else {
      setIsFavorite(false);
    }
  }, [movie, favorites]);
  
  if (!movie) return null;
  
  const posterUrl = getImageUrl(movie.posterPath);
  const backdropUrl = getImageUrl(movie.backdropPath, 'original');
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : '';
  const rating = movie.voteAverage ? `${movie.voteAverage}/10` : 'N/A';
  const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';
  
  // Parse genres and cast from JSON strings if needed
  let genres: string[] = [];
  let cast: string[] = [];
  
  try {
    // If the genres is a string (JSON), parse it
    if (typeof movie.genres === 'string') {
      genres = JSON.parse(movie.genres);
    } else {
      // Otherwise, use it as-is (for backward compatibility)
      genres = movie.genres;
    }
    
    // If the cast is a string (JSON), parse it
    if (typeof movie.cast === 'string') {
      cast = JSON.parse(movie.cast);
    } else {
      // Otherwise, use it as-is (for backward compatibility)
      cast = movie.cast;
    }
  } catch (error) {
    console.error("Error parsing genres or cast:", error);
  }
  
  const handleWatchClick = async () => {
    try {
      const { streamUrl } = await getStreamUrl(movie.tmdbId, movie.mediaType);
      setStreamUrl(streamUrl);
      setIsWatching(true);
    } catch (error) {
      console.error("Error getting stream URL:", error);
    }
  };
  
  const handleAddToFavorites = async () => {
    if (isAddingToFavorites) return;
    
    try {
      setIsAddingToFavorites(true);
      await addToFavorites(movie.id, movie.mediaType);
      
      // Invalidate the favorites query to refresh the favorites list
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      
      toast({
        title: "Added to favorites",
        description: `${movie.title} has been added to your favorites.`,
      });
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToFavorites(false);
    }
  };
  
  const handleRemoveFromFavorites = async () => {
    if (isRemovingFavorite) return;
    
    try {
      setIsRemovingFavorite(true);
      // Find the favorite with the matching tmdbId and mediaType
      const favorite = favorites.find(fav => fav.tmdbId === movie.tmdbId && fav.mediaType === movie.mediaType);
      
      if (favorite) {
        await removeFromFavorites(favorite.id);
        
        // Invalidate the favorites query to refresh the favorites list
        queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
        
        toast({
          title: "Removed from favorites",
          description: `${movie.title} has been removed from your favorites.`,
        });
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemovingFavorite(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setIsWatching(false);
        setStreamUrl(null);
      }
    }}>
      <DialogContent className="bg-surface p-0 max-w-4xl max-h-[90vh] overflow-y-auto mx-4 rounded-lg">
        <DialogTitle className="sr-only">{movie.title}</DialogTitle>
        <button 
          className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        
        {isWatching && streamUrl ? (
          <div className="w-full aspect-video bg-black relative">
            <iframe 
              src={streamUrl}
              className="w-full h-full border-0"
              allowFullScreen
              allow="encrypted-media"
              title={`Watch ${movie.title}`}
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            ></iframe>
            {/* This overlay prevents interaction with the duplicate X button in the iframe */}
            <div className="absolute top-0 right-0 w-12 h-12 z-10"></div>
          </div>
        ) : (
          <div id="movieDetails" className="flex flex-col">
            <div className="relative">
              <div className="w-full h-64 sm:h-80 bg-gray-800 overflow-hidden">
                {movie.backdropPath ? (
                  <img 
                    className="w-full h-full object-cover" 
                    src={backdropUrl}
                    alt={`${movie.title} backdrop`}
                    onError={(e) => {
                      // Hide the image and show the No Image text
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const noImageText = document.createElement('div');
                        noImageText.className = "flex h-full w-full items-center justify-center";
                        noImageText.innerHTML = '<p class="text-gray-400 text-center">No Image</p>';
                        parent.appendChild(noImageText);
                      }
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-gray-400 text-center">No Image</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">{movie.title}</h3>
                <div className="flex items-center mt-2">
                  <span className="text-gray-400">{year}</span>
                  {year && <span className="mx-2">•</span>}
                  <span className="text-gray-400">{rating}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-400">{runtime}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="sm:w-1/3">
                  <div className="rounded-lg overflow-hidden bg-gray-800 aspect-[2/3]">
                    {movie.posterPath ? (
                      <img 
                        className="w-full h-full object-cover" 
                        src={posterUrl} 
                        alt={`${movie.title} poster`}
                        onError={(e) => {
                          // Hide the image and show No Image text
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const noImageText = document.createElement('div');
                            noImageText.className = "flex h-full w-full items-center justify-center";
                            noImageText.innerHTML = '<p class="text-gray-400 text-center">No Image</p>';
                            parent.appendChild(noImageText);
                          }
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <p className="text-gray-400 text-center">No Image</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="sm:w-2/3">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {genres.map((genre, index) => (
                      <span 
                        key={index} 
                        className="inline-block px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-gray-400 mb-6">
                    {movie.overview || 'No overview available.'}
                  </p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Cast</h4>
                    <p className="text-gray-400 mb-6">
                      {cast.length > 0 
                        ? cast.join(', ')
                        : 'No cast information available.'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/80 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition"
                      onClick={handleWatchClick}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Watch Now
                    </Button>
                    
                    {isFavorite ? (
                      <Button 
                        className="px-4 rounded-lg bg-primary/20 hover:bg-primary/30 text-white flex items-center justify-center transition"
                        onClick={handleRemoveFromFavorites}
                        disabled={isRemovingFavorite}
                        title="Remove from favorites"
                      >
                        <HeartOff className={`h-5 w-5 ${isRemovingFavorite ? 'animate-pulse' : ''}`} />
                      </Button>
                    ) : (
                      <Button 
                        className="px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition"
                        onClick={handleAddToFavorites}
                        disabled={isAddingToFavorites}
                        title="Add to favorites"
                      >
                        <Heart className={`h-5 w-5 ${isAddingToFavorites ? 'animate-pulse' : ''}`} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MovieModal;
