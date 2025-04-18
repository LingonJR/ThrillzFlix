import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import { Movie } from "@/types/movie";
import { Loader2 } from "lucide-react";
import { getFavorites } from "@/lib/api";

const FavoritesPage: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const { data: favorites = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/favorites'],
    queryFn: getFavorites,
  });
  
  // Handle movie selection
  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };
  
  // Empty search handler (required by Header component)
  const handleSearch = (query: string) => {
    console.log("Search not available in Favorites");
  };
  
  return (
    <div className="bg-dark text-white min-h-screen">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">My Favorites</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">You don't have any favorites yet.</p>
              <p className="text-gray-500 mt-2">Go to the home page and add movies or TV shows to your favorites!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onClick={handleMovieClick} 
                  showRemoveButton={true}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      
      <MovieModal 
        movie={selectedMovie} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default FavoritesPage;