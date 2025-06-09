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
  X
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
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">DaloaMarket</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="px-6 py-6 space-y-8 overflow-y-auto h-full pb-20">
        {/* User Section */}
        {user ? (
          <div className="bg-gradient-to-br from-grey-50 to-grey-100 rounded-2xl p-6 border border-grey-200">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-4">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-grey-900 truncate">
                  {userProfile?.full_name || 'Utilisateur'}
                </p>
                <p className="text-sm text-grey-600 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => handleNavigation('/profile')}
              className="w-full btn-outline py-2 text-sm"
            >
              Voir le profil
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button 
              onClick={() => handleNavigation('/login')}
              className="btn-primary w-full py-3"
            >
              Connexion
            </button>
            <button 
              onClick={() => handleNavigation('/register')}
              className="btn-outline w-full py-3"
            >
              Inscription
            </button>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-2">
          <h3 className="text-sm font-semibold text-grey-500 uppercase tracking-wider mb-4">Navigation</h3>
          
          <button 
            onClick={() => handleNavigation('/')}
            className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-grey-50 transition-colors group"
          >
            <Home className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
            <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Accueil</span>
          </button>

          <button 
            onClick={() => handleNavigation('/search')}
            className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-grey-50 transition-colors group"
          >
            <Search className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
            <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Rechercher</span>
          </button>

          <button 
            onClick={() => handleNavigation('/create-listing')}
            className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-primary-50 transition-colors group bg-primary-50 border border-primary-200"
          >
            <PlusCircle className="h-6 w-6 text-primary" />
            <span className="ml-4 text-primary font-semibold">Vendre un article</span>
          </button>

          <button 
            onClick={() => handleNavigation('/messages')}
            className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-grey-50 transition-colors group"
          >
            <MessageSquare className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
            <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Messages</span>
            <div className="ml-auto w-2 h-2 bg-error-500 rounded-full"></div>
          </button>

          {user && (
            <button 
              onClick={() => handleNavigation('/acheter-credits')}
              className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-grey-50 transition-colors group"
            >
              <CreditCard className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
              <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Acheter des crédits</span>
            </button>
          )}
        </nav>

        {/* Account Section */}
        {user && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-grey-500 uppercase tracking-wider mb-4">Compte</h3>
            
            <button 
              onClick={() => handleNavigation('/settings')}
              className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-grey-50 transition-colors group"
            >
              <Settings className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
              <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Paramètres</span>
            </button>

            <button 
              onClick={handleSignOut}
              className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-error-50 transition-colors group"
            >
              <LogOut className="h-6 w-6 text-error-600" />
              <span className="ml-4 font-medium text-error-600">Déconnexion</span>
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="pt-6 border-t border-grey-200">
          <button 
            onClick={() => handleNavigation('/help')}
            className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-grey-50 transition-colors group"
          >
            <HelpCircle className="h-6 w-6 text-grey-600 group-hover:text-primary transition-colors" />
            <span className="ml-4 text-grey-900 font-medium group-hover:text-primary transition-colors">Aide & Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;