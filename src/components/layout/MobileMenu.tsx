import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, User, ShoppingBag, MessageSquare, LogOut, HelpCircle, Settings, PlusCircle } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const { user, signOut } = useSupabase();
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
      <div className="container-custom py-6">
        <div className="space-y-6">
          {user ? (
            <div className="flex items-center pb-4 border-b border-grey-200">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                <User className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-grey-900">
                  {user.email}
                </p>
                <button 
                  onClick={() => handleNavigation('/profile')}
                  className="text-sm text-primary"
                >
                  Voir le profil
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3 pb-4 border-b border-grey-200">
              <button 
                onClick={() => handleNavigation('/login')}
                className="btn-primary"
              >
                Connexion
              </button>
              <button 
                onClick={() => handleNavigation('/register')}
                className="btn-outline"
              >
                Inscription
              </button>
            </div>
          )}

          <nav className="space-y-6">
            <button 
              onClick={() => handleNavigation('/')}
              className="flex items-center w-full py-3"
            >
              <Home className="h-6 w-6 text-grey-700" />
              <span className="ml-3 text-grey-900 font-medium">Accueil</span>
            </button>

            <button 
              onClick={() => handleNavigation('/search')}
              className="flex items-center w-full py-3"
            >
              <Search className="h-6 w-6 text-grey-700" />
              <span className="ml-3 text-grey-900 font-medium">Rechercher</span>
            </button>

            <button 
              onClick={() => handleNavigation('/create-listing')}
              className="flex items-center w-full py-3"
            >
              <PlusCircle className="h-6 w-6 text-grey-700" />
              <span className="ml-3 text-grey-900 font-medium">Vendre un article</span>
            </button>

            <button 
              onClick={() => handleNavigation('/messages')}
              className="flex items-center w-full py-3"
            >
              <MessageSquare className="h-6 w-6 text-grey-700" />
              <span className="ml-3 text-grey-900 font-medium">Messages</span>
            </button>

            {user && (
              <>
                <button 
                  onClick={() => handleNavigation('/settings')}
                  className="flex items-center w-full py-3"
                >
                  <Settings className="h-6 w-6 text-grey-700" />
                  <span className="ml-3 text-grey-900 font-medium">Paramètres</span>
                </button>

                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full py-3 text-error-600"
                >
                  <LogOut className="h-6 w-6" />
                  <span className="ml-3 font-medium">Déconnexion</span>
                </button>
              </>
            )}
          </nav>

          <div className="pt-6 border-t border-grey-200">
            <button 
              onClick={() => handleNavigation('/help')}
              className="flex items-center w-full py-3"
            >
              <HelpCircle className="h-6 w-6 text-grey-700" />
              <span className="ml-3 text-grey-900 font-medium">Aide & Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;