import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter } from 'lucide-react';

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
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative group">
        <div className="relative">
          <input
            type="text"
            placeholder="Que recherchez-vous ?"
            className="w-full py-4 pl-14 pr-32 text-lg rounded-2xl border-2 border-grey-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-lg group-hover:shadow-xl transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SearchIcon className="absolute left-5 top-4.5 h-6 w-6 text-grey-400" />
          <button 
            type="submit"
            className="absolute right-3 top-2 bg-primary text-white py-2.5 px-6 rounded-xl hover:bg-primary-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            Rechercher
          </button>
        </div>
      </form>
      
      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {['Mode', 'Électronique', 'Maison', 'Auto', 'Sports'].map((category) => (
          <button
            key={category}
            onClick={() => navigate(`/search?category=${category.toLowerCase()}`)}
            className="px-4 py-2 bg-white border border-grey-200 rounded-full text-sm font-medium text-grey-700 hover:bg-primary-50 hover:border-primary-200 hover:text-primary transition-all"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;