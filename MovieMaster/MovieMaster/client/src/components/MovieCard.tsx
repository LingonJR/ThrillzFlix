import React from "react";
import { Movie } from "@/types/movie";
import { getImageUrl, getYear, removeFromFavorites } from "@/lib/api";
import { HeartOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  showRemoveButton?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, showRemoveButton = false }) => {
  const queryClient = useQueryClient();
  const [isRemoving, setIsRemoving] = React.useState(false);
  
  const handleClick = () => {
    onClick(movie);
  };
  
  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event from firing
    
    if (isRemoving) return;
    
    try {
      setIsRemoving(true);
      await removeFromFavorites(movie.id);
      
      // Invalidate the favorites query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      
      toast({
        title: "Removed from favorites",
        description: `${movie.title} has been removed from your favorites.`,
      });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };
  
  const posterUrl = getImageUrl(movie.posterPath);
  const year = getYear(movie.releaseDate);
  const hasPoster = movie.posterPath !== null;
  
  return (
    <div 
      className="movie-card rounded-lg overflow-hidden bg-surface shadow-lg hover:shadow-2xl transition-transform hover:scale-105 cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
        {hasPoster ? (
          <img 
            src={posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Set a flag to indicate the image failed to load
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.classList.add('no-image');
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400 text-center">No Image</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between">
          {showRemoveButton && (
            <div className="p-2 self-end">
              <button 
                className="bg-primary/20 hover:bg-primary/30 text-white p-1.5 rounded-full transition-colors"
                onClick={handleRemove}
                disabled={isRemoving}
                title="Remove from favorites"
              >
                <HeartOff className={`h-4 w-4 ${isRemoving ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          )}
          <div className="p-3">
            <h3 className="font-medium text-white">{movie.title}</h3>
            <p className="text-sm text-gray-300">{year}</p>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate" title={movie.title}>{movie.title}</h3>
        <p className="text-sm text-gray-400">{year}</p>
      </div>
    </div>
  );
};

export default MovieCard;
