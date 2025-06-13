import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  User, 
  MessageSquare, 
  PlusCircle,
  Settings,
  LogOut,
  CreditCard
} from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const { user, signOut, userProfile } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Bottom Navigation Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-grey-200 shadow-2xl">
        {user ? (
          // Navigation pour utilisateur connecté
          <>
            {/* Main Navigation Grid - 5 boutons */}
            <div className="grid grid-cols-5 gap-1 p-2">
              <button
                onClick={() => handleNavigation('/')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all ${
                  isActive('/') 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-grey-600 hover:bg-grey-100'
                }`}
              >
                <Home className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Accueil</span>
              </button>

              <button
                onClick={() => handleNavigation('/search')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all ${
                  isActive('/search') 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-grey-600 hover:bg-grey-100'
                }`}
              >
                <Search className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Recherche</span>
              </button>

              <button
                onClick={() => handleNavigation('/create-listing')}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-gradient-to-br from-primary to-primary-600 text-white shadow-lg transform hover:scale-105 transition-all"
              >
                <PlusCircle className="h-6 w-6 mb-1" />
                <span className="text-xs font-bold">Vendre</span>
              </button>

              <button
                onClick={() => handleNavigation('/messages')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all relative ${
                  isActive('/messages') 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-grey-600 hover:bg-grey-100'
                }`}
              >
                <MessageSquare className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Messages</span>
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></div>
              </button>

              <button
                onClick={() => handleNavigation('/profile')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all ${
                  isActive('/profile') 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-grey-600 hover:bg-grey-100'
                }`}
              >
                <User className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Profil</span>
              </button>
            </div>

            {/* User Section */}
            <div className="border-t border-grey-200 p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-grey-900 truncate">
                      {userProfile?.full_name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-grey-600 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleNavigation('/acheter-credits')}
                  className="flex flex-col items-center py-2 px-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all"
                >
                  <CreditCard className="h-4 w-4 text-blue-600 mb-1" />
                  <span className="text-xs font-medium text-blue-700">Crédits</span>
                </button>

                <button
                  onClick={() => handleNavigation('/settings')}
                  className="flex flex-col items-center py-2 px-3 bg-gradient-to-br from-grey-50 to-grey-100 rounded-lg border border-grey-200 hover:from-grey-100 hover:to-grey-200 transition-all"
                >
                  <Settings className="h-4 w-4 text-grey-600 mb-1" />
                  <span className="text-xs font-medium text-grey-700">Réglages</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex flex-col items-center py-2 px-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 hover:from-red-100 hover:to-red-200 transition-all"
                >
                  <LogOut className="h-4 w-4 text-red-600 mb-1" />
                  <span className="text-xs font-medium text-red-700">Sortir</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          // Navigation pour utilisateur non connecté - Seulement Connexion/Inscription
          <div className="p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-grey-900 mb-2">Rejoignez DaloaMarket</h3>
              <p className="text-sm text-grey-600">Connectez-vous pour accéder à toutes les fonctionnalités</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleNavigation('/login')}
                className="py-3 px-4 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors shadow-lg"
              >
                Connexion
              </button>
              <button
                onClick={() => handleNavigation('/register')}
                className="py-3 px-4 border-2 border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary-50 transition-colors"
              >
                Inscription
              </button>
            </div>

            {/* Quick access to browse */}
            <div className="mt-4 pt-4 border-t border-grey-200">
              <button
                onClick={() => handleNavigation('/search')}
                className="w-full py-2 px-4 bg-grey-100 text-grey-700 rounded-lg font-medium text-sm hover:bg-grey-200 transition-colors"
              >
                Parcourir les annonces
              </button>
            </div>
          </div>
        )}

        {/* Safe area for devices with home indicator */}
        <div className="h-safe-area-bottom"></div>
      </div>
    </>
  );
};

export default MobileMenu;