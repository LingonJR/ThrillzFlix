import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState<string>("");
  
  // Debounce the search to avoid too many requests
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      if (searchTerm.length > 2) {
        onSearch(searchTerm);
      }
    }, 500),
    [onSearch]
  );
  
  useEffect(() => {
    debouncedSearch(query);
    
    // Cleanup the debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);
  
  return (
    <div className="w-full sm:w-96">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface py-2 px-4 rounded-full border border-gray-700 focus:outline-none focus:border-primary text-white"
        />
        <button className="absolute right-3 top-2 text-gray-400">
          <Search className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Helper function to debounce function calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
} {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const debounced = function (...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debounced.cancel = function () {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

export default SearchBar;
