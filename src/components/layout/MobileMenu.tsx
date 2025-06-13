import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  User, 
  ShoppingBag, 
  MessageSquare, 
  LogOut, 
  HelpCircle, 
  Settings, 
  PlusCircle,
  CreditCard,
  X,
  ChevronDown
} from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const { user, signOut, userProfile } = useSupabase();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay sombre pour fermer le menu */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Menu content - Hauteur augmentée à 4 fois la taille */}
      <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header fixe - Plus grand */}
        <div className="bg-gradient-to-r from-primary to-primary-600 px-6 py-8 flex items-center justify-between flex-shrink-0 shadow-lg">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DaloaMarket</span>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors touch-target"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        {/* Contenu défilable avec indicateur visuel - Beaucoup plus d'espace */}
        <div className="flex-1 overflow-y-auto bg-white relative">
          {/* Indicateur de défilement en haut */}
          <div className="sticky top-0 bg-gradient-to-b from-white to-transparent h-8 flex justify-center items-start pt-4 z-10">
            <ChevronDown className="h-6 w-6 text-grey-400 animate-bounce" />
          </div>

          <div className="px-6 pb-12 space-y-12">
            {/* User Section - Plus grand */}
            {user ? (
              <div className="bg-gradient-to-br from-grey-50 to-grey-100 rounded-2xl p-8 border border-grey-200 shadow-sm">
                <div className="flex items-center mb-8">
                  <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-6 flex-shrink-0">
                    <User className="h-10 w-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-grey-900 truncate text-xl mb-2">
                      {userProfile?.full_name || 'Utilisateur'}
                    </p>
                    <p className="text-base text-grey-600 truncate">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleNavigation('/profile')}
                  className="w-full btn-outline py-4 text-lg font-semibold"
                >
                  Voir le profil
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="btn-primary w-full py-6 text-xl font-semibold"
                >
                  Connexion
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="btn-outline w-full py-6 text-xl font-semibold"
                >
                  Inscription
                </button>
              </div>
            )}

            {/* Main Navigation - Plus d'espace entre les éléments */}
            <nav className="space-y-3">
              <h3 className="text-lg font-semibold text-grey-500 uppercase tracking-wider mb-6 px-4">Navigation</h3>
              
              <button 
                onClick={() => handleNavigation('/')}
                className="flex items-center w-full py-6 px-4 rounded-2xl hover:bg-grey-50 transition-colors group"
              >
                <Home className="h-8 w-8 text-grey-600 group-hover:text-primary transition-colors" />
                <span className="ml-6 text-grey-900 font-medium group-hover:text-primary transition-colors text-xl">Accueil</span>
              </button>

              <button 
                onClick={() => handleNavigation('/search')}
                className="flex items-center w-full py-6 px-4 rounded-2xl hover:bg-grey-50 transition-colors group"
              >
                <Search className="h-8 w-8 text-grey-600 group-hover:text-primary transition-colors" />
                <span className="ml-6 text-grey-900 font-medium group-hover:text-primary transition-colors text-xl">Rechercher</span>
              </button>

              <button 
                onClick={() => handleNavigation('/create-listing')}
                className="flex items-center w-full py-6 px-4 rounded-2xl hover:bg-primary-50 transition-colors group bg-primary-50 border border-primary-200"
              >
                <PlusCircle className="h-8 w-8 text-primary" />
                <span className="ml-6 text-primary font-semibold text-xl">Vendre un article</span>
              </button>

              <button 
                onClick={() => handleNavigation('/messages')}
                className="flex items-center w-full py-6 px-4 rounded-2xl hover:bg-grey-50 transition-colors group"
              >
                <MessageSquare className="h-8 w-8 text-grey-600 group-hover:text-primary transition-colors" />
                <span className="ml-6 text-grey-900 font-medium group-hover:text-primary transition-colors text-xl">Messages</span>
                <div className="ml-auto w-4 h-4 bg-error-500 rounded-full"></div>
              </button>

              {user && (
                <button 
                  onClick={() => handleNavigation('/acheter-credits')}
                  className="flex items-center w-full py-6 px-4 rounded-2xl hover:bg-grey-50 transition-colors group"
                >
                  <CreditCard className="h-8 w-8 text-grey-600 group-hover:text-primary transition-colors" />
                  <span className="ml-6 text-grey-900 font-medium group-hover:text-primary transition-colors text-xl">Acheter des crédits</span>
                </button>
              )}
            </nav>

            {/* Account Section - Plus d'espace */}
            {user && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-grey-500 uppercase tracking-wider mb-6 px-4">Compte</h3>
                
                <button 
                  onClick={() => handleNavigation('/settings')}
                  className="flex items-center w-full py-6 px-4 rounded-2xl hover:bg-grey-50 transition-colors group"
                >
                  <Settings className="h-8 w-8 text-grey-600 group-hover:text-primary transition-colors" />
                  <span className="ml-6 text-grey-900 font-medium group-hover:text-primary transition-colors text-xl">Paramètres</span>
                </button>

                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full py-6 px-4 rounded-2xl hover:bg-error-50 transition-colors group"
                >
                  <LogOut className="h-8 w-8 text-error-600" />
                  <span className="ml-6 font-medium text-error-600 text-xl">Déconnexion</span>
                </button>
              </div>
            )}

            {/* Help Section - Plus d'espace */}
            <div className="pt-8 border-t border-grey-200">
              <button 
                onClick={() => handleNavigation('/help')}
                className="flex items-center w-full py-6 px-4 rounded-2xl hover:bg-grey-50 transition-colors group"
              >
                <HelpCircle className="h-8 w-8 text-grey-600 group-hover:text-primary transition-colors" />
                <span className="ml-6 text-grey-900 font-medium group-hover:text-primary transition-colors text-xl">Aide & Support</span>
              </button>
            </div>

            {/* Espacement en bas pour indiquer la fin */}
            <div className="h-16"></div>
          </div>

          {/* Indicateur de défilement en bas - Plus visible */}
          <div className="sticky bottom-0 bg-gradient-to-t from-white to-transparent h-8 flex justify-center items-end pb-4">
            <div className="w-16 h-2 bg-grey-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;