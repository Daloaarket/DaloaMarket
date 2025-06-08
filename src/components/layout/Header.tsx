import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, User, ShoppingBag, MessageSquare, X, Bell } from 'lucide-react';
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
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-grey-100">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-grey-900 leading-none">DaloaMarket</span>
              <BetaBadge />
            </div>
          </Link>

          {/* Search Bar (hidden on mobile) */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full py-3 pl-12 pr-4 rounded-2xl border border-grey-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-grey-50 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-grey-400" />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bg-primary text-white py-2 px-4 rounded-xl hover:bg-primary-600 transition-colors font-medium"
              >
                Rechercher
              </button>
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link 
              to="/search" 
              className="p-3 rounded-xl text-grey-700 hover:text-primary hover:bg-primary-50 transition-all"
              title="Rechercher"
            >
              <Search className="h-6 w-6" />
            </Link>
            
            <Link 
              to="/messages" 
              className="p-3 rounded-xl text-grey-700 hover:text-primary hover:bg-primary-50 transition-all relative"
              title="Messages"
            >
              <MessageSquare className="h-6 w-6" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></div>
            </Link>
            
            {user ? (
              <Link 
                to="/profile" 
                className="p-3 rounded-xl text-grey-700 hover:text-primary hover:bg-primary-50 transition-all"
                title="Mon profil"
              >
                <User className="h-6 w-6" />
              </Link>
            ) : (
              <Link to="/login" className="btn-outline py-2 px-6 ml-2">
                Connexion
              </Link>
            )}
            
            <Link to="/create-listing" className="btn-primary py-3 px-6 ml-2 font-semibold">
              Vendre
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-xl text-grey-700 hover:bg-grey-100 transition-colors" 
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
        <div className="mt-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full py-3 pl-12 pr-4 rounded-2xl border border-grey-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-grey-50 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-grey-400" />
            <button
              type="submit"
              className="absolute right-2 top-1.5 bg-primary text-white py-2 px-4 rounded-xl hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              Rechercher
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && <MobileMenu onClose={toggleMenu} />}
    </header>
  );
};

export default Header;