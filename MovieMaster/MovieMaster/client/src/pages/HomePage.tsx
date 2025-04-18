import React, { useState, useEffect, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import { fetchMovies, searchMovies } from "@/lib/api";
import { Movie } from "@/types/movie";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { data: movies = [], isLoading, isFetching, isPending, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['/api/movies'],
    queryFn: ({ pageParam = 1 }) => fetchMovies(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const allMovies = movies.pages?.flat() ?? [];
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastMovieElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetching || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isSearching) {
        fetchNextPage();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isFetching, hasNextPage, isSearching, fetchNextPage]);
  
  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (query.length > 2) {
      setSearchQuery(query);
      setIsSearching(true);
      
      try {
        const results = await searchMovies(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      }
    } else if (query.length === 0) {
      clearSearch();
    }
  }, []);
  
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
  };
  
  // Handle movie selection
  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };
  
  return (
    <div className="bg-dark text-white min-h-screen">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Search Results Section */}
        {isSearching && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              Search Results
              <span className="ml-2 text-gray-400 text-lg font-normal">"{searchQuery}"</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-3 text-sm bg-surface px-2 py-1 rounded-full hover:bg-gray-700"
                onClick={clearSearch}
              >
                Clear
              </Button>
            </h2>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No movies found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onClick={handleMovieClick} 
                  />
                ))}
              </div>
            )}
          </section>
        )}
        
        {/* All Movies Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">All Movies</h2>
          
          {isLoading && movies.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allMovies.map((movie, index) => {
                if (allMovies.length === index + 1) {
                  return (
                    <div key={movie.id} ref={lastMovieElementRef}>
                      <MovieCard 
                        movie={movie} 
                        onClick={handleMovieClick} 
                      />
                    </div>
                  );
                } else {
                  return (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onClick={handleMovieClick} 
                    />
                  );
                }
              })}
            </div>
          )}
          
          {(isFetching || isPending) && (
            <div className="flex justify-center my-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
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

export default HomePage;
