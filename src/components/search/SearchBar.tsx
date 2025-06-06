import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  initialQuery = '', 
  className = '' 
}) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Rechercher un produit..."
        className="w-full py-3 pl-12 pr-4 rounded-xl border border-grey-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <SearchIcon className="absolute left-4 top-3.5 h-6 w-6 text-grey-400" />
      <button 
        type="submit"
        className="absolute right-3 top-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
      >
        Rechercher
      </button>
    </form>
  );
};

export default SearchBar;