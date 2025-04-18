import React from "react";
import { Link, useLocation } from "wouter";
import SearchBar from "./SearchBar";

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [location] = useLocation();
  
  return (
    <header className="sticky top-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold">
            <Link href="/" className="flex items-center">
              <span className="text-primary mr-1">Thrillz</span>
              <span className="text-white">Flix</span>
              <span className="text-primary ml-1 text-xl">🔥</span>
            </Link>
          </h1>
          
          <nav className="flex items-center space-x-4 mt-3 sm:mt-0 sm:ml-8">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/" 
                  ? "bg-primary/20 text-primary" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link 
              href="/favorites" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/favorites" 
                  ? "bg-primary/20 text-primary" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Favorites
            </Link>
            <Link 
              href="/contact" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/contact" 
                  ? "bg-primary/20 text-primary" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Contact
            </Link>
          </nav>
        </div>
        
        {/* Only show search bar on home page */}
        {location === "/" && <SearchBar onSearch={onSearch} />}
      </div>
    </header>
  );
};

export default Header;
