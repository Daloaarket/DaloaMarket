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
      
      {/* Menu content - Prend toute la hauteur et largeur souhaitée */}
      <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col">
        {/* Header fixe */}
        <div className="bg-gradient-to-r from-primary to-primary-600 px-4 py-4 flex items-center justify-between flex-shrink-0 shadow-lg">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">DaloaMarket</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors touch-target"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu défilable avec indicateur visuel */}
        <div className="flex-1 overflow-y-auto bg-white relative">
          {/* Indicateur de défilement en haut */}
          <div className="sticky top-0 bg-gradient-to-b from-white to-transparent h-4 flex justify-center items-start pt-2 z-10">
            <ChevronDown className="h-4 w-4 text-grey-400 animate-bounce" />
          </div>

          <div className="px-4 pb-6 space-y-6">
            {/* User Section */}
            {user ? (
              <div className="bg-gradient-to-br from-grey-50 to-grey-100 rounded-xl p-4 border border-grey-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3 flex-shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-grey-900 truncate text-sm">
                      {userProfile?.full_name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-grey-600 truncate">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleNavigation('/profile')}
                  className="w-full btn-outline py-2.5 text-sm"
                >
                  Voir le profil
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="btn-primary w-full py-3 text-base"
                >
                  Connexion
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="btn-outline w-full py-3 text-base"
                >
                  Inscription
                </button>
              </div>
            )}

            {/* Main Navigation */}
            <nav className="space-y-1">
              <h3 className="text-sm font-semibold text-grey-500 uppercase tracking-wider mb-3 px-3">Navigation</h3>
              
              <button 
                onClick={() => handleNavigation('/')}
                className="flex items-center w-full py-3 px-3 rounded-lg hover:bg-grey-50 transition-colors group"
              >
                <Home className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
                <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Accueil</span>
              </button>

              <button 
                onClick={() => handleNavigation('/search')}
                className="flex items-center w-full py-3 px-3 rounded-lg hover:bg-grey-50 transition-colors group"
              >
                <Search className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
                <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Rechercher</span>
              </button>

              <button 
                onClick={() => handleNavigation('/create-listing')}
                className="flex items-center w-full py-3 px-3 rounded-lg hover:bg-primary-50 transition-colors group bg-primary-50 border border-primary-200"
              >
                <PlusCircle className="h-6 w-6 text-primary" />
                <span className="ml-4 text-primary font-semibold">Vendre un article</span>
              </button>

              <button 
                onClick={() => handleNavigation('/messages')}
                className="flex items-center w-full py-3 px-3 rounded-lg hover:bg-grey-50 transition-colors group"
              >
                <MessageSquare className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
                <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Messages</span>
                <div className="ml-auto w-2 h-2 bg-error-500 rounded-full"></div>
              </button>

              {user && (
                <button 
                  onClick={() => handleNavigation('/acheter-credits')}
                  className="flex items-center w-full py-3 px-3 rounded-lg hover:bg-grey-50 transition-colors group"
                >
                  <CreditCard className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
                  <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Acheter des crédits</span>
                </button>
              )}
            </nav>

            {/* Account Section */}
            {user && (
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-grey-500 uppercase tracking-wider mb-3 px-3">Compte</h3>
                
                <button 
                  onClick={() => handleNavigation('/settings')}
                  className="flex items-center w-full py-3 px-3 rounded-lg hover:bg-grey-50 transition-colors group"
                >
                  <Settings className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
                  <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Paramètres</span>
                </button>

                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full py-3 px-3 rounded-lg hover:bg-error-50 transition-colors group"
                >
                  <LogOut className="h-6 w-6 text-error-600" />
                  <span className="ml-4 font-medium text-error-600">Déconnexion</span>
                </button>
              </div>
            )}

            {/* Help Section */}
            <div className="pt-4 border-t border-grey-200">
              <button 
                onClick={() => handleNavigation('/help')}
                className="flex items-center w-full py-3 px-3 rounded-lg hover:bg-grey-50 transition-colors group"
              >
                <HelpCircle className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
                <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Aide & Support</span>
              </button>
            </div>

            {/* Espacement en bas pour indiquer la fin */}
            <div className="h-8"></div>
          </div>

          {/* Indicateur de défilement en bas */}
          <div className="sticky bottom-0 bg-gradient-to-t from-white to-transparent h-4 flex justify-center items-end pb-2">
            <div className="w-12 h-1 bg-grey-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;