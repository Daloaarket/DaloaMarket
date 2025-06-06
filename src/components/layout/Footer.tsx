import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-grey-200 mt-auto">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-grey-900">DaloaMarket</span>
            </Link>
            <p className="mt-4 text-grey-600">
              La première marketplace P2P de Daloa. Achetez et vendez facilement depuis chez vous.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-grey-600 hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-grey-600 hover:text-primary transition-colors">
                  Rechercher
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-grey-600 hover:text-primary transition-colors">
                  Vendre un article
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-grey-600 hover:text-primary transition-colors">
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Catégories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search?category=fashion" className="text-grey-600 hover:text-primary transition-colors">
                  Mode & Accessoires
                </Link>
              </li>
              <li>
                <Link to="/search?category=electronics" className="text-grey-600 hover:text-primary transition-colors">
                  Électronique & High-tech
                </Link>
              </li>
              <li>
                <Link to="/search?category=home" className="text-grey-600 hover:text-primary transition-colors">
                  Maison & Jardin
                </Link>
              </li>
              <li>
                <Link to="/search?category=vehicles" className="text-grey-600 hover:text-primary transition-colors">
                  Auto & Moto
                </Link>
              </li>
              <li>
                <Link to="/search?category=sports" className="text-grey-600 hover:text-primary transition-colors">
                  Sports & Loisirs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mt-0.5 mr-2" />
                <span className="text-grey-600">Daloa, Côte d'Ivoire</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <span className="text-grey-600">+225 07 88 00 08 31</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <span className="text-grey-600">oulobotresorelmas@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-grey-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-grey-600 text-sm">
              &copy; {new Date().getFullYear()} DaloaMarket. Tous droits réservés.<br />
              <span className="text-xs text-orange-600 block mt-1">
                ⚠️ Daloa Market est actuellement un projet en version bêta, développé à titre personnel par un étudiant. Aucune entreprise formelle n’a encore été créée. Les fonctionnalités proposées sont expérimentales et peuvent évoluer.
              </span>
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/terms" className="text-grey-600 hover:text-primary text-sm transition-colors">
                Conditions d'utilisation
              </Link>
              <Link to="/privacy" className="text-grey-600 hover:text-primary text-sm transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/help" className="text-grey-600 hover:text-primary text-sm transition-colors">
                Aide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;