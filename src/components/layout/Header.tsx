import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User, ShoppingBag, MessageSquare, X } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import MobileMenu from './MobileMenu';
import BetaBadge from './BetaBadge';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useSupabase();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-grey-900">DaloaMarket</span>
            <BetaBadge />
          </Link>

          {/* Search Bar (hidden on mobile) */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full py-2 pl-10 pr-4 rounded-full border border-grey-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-grey-400" />
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/search" className="text-grey-700 hover:text-primary transition-colors">
              <Search className="h-6 w-6" />
            </Link>
            <Link to="/messages" className="text-grey-700 hover:text-primary transition-colors">
              <MessageSquare className="h-6 w-6" />
            </Link>
            {user ? (
              <Link to="/profile" className="text-grey-700 hover:text-primary transition-colors">
                <User className="h-6 w-6" />
              </Link>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-4">
                Connexion
              </Link>
            )}
            <Link to="/create-listing" className="btn-secondary py-2 px-4">
              Vendre
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-grey-700 focus:outline-none" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search (visible only on mobile) */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full py-2 pl-10 pr-4 rounded-full border border-grey-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-grey-400" />
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && <MobileMenu onClose={toggleMenu} />}
    </header>
  );
};

export default Header;