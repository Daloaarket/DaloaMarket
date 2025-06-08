import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, AlertCircle, TrendingUp, Users, Shield, Smartphone } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';
import SearchBar from '../components/search/SearchBar';
import ListingCard from '../components/listings/ListingCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CATEGORIES } from '../lib/utils';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'react-hot-toast';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingWithSeller = Listing & { seller_name: string; seller_rating: number | null };

const HomePage: React.FC = () => {
  const [latestListings, setLatestListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, user } = useSupabase();
  const [userCredits, setUserCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchLatestListings = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            users:user_id (
              full_name,
              rating
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;

        const formattedListings = data.map(item => ({
          ...item,
          seller_name: item.users?.full_name || 'Utilisateur',
          seller_rating: item.users?.rating || null
        }));

        setLatestListings(formattedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestListings();
  }, []);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id || !isSupabaseConfigured) {
        setUserCredits(null);
        return;
      }
      // @ts-expect-error accès table custom
      const { data, error } = await (supabase as unknown)
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();
      if (error) {
        setUserCredits(null);
      } else {
        setUserCredits(data?.credits ?? 0);
      }
    };
    fetchCredits();
  }, [user]);

  useEffect(() => {
    if (localStorage.getItem('credit_purchase_pending')) {
      toast.success('Crédits ajoutés à votre compte !');
      localStorage.removeItem('credit_purchase_pending');
    }
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100">
        <section className="py-20">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-warning-200">
                <AlertCircle className="h-20 w-20 text-warning-600 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-warning-800 mb-4">Configuration Required</h2>
                <p className="text-warning-700 mb-8 text-lg">
                  To use DaloaMarket, you need to configure your Supabase database connection.
                </p>
                <div className="bg-grey-50 rounded-2xl p-6 text-left">
                  <h3 className="font-semibold mb-4 text-lg">Setup Instructions:</h3>
                  <ol className="list-decimal list-inside space-y-3 text-sm">
                    <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">supabase.com</a> and create a new project</li>
                    <li>In your Supabase dashboard, go to Settings → API</li>
                    <li>Copy your Project URL and anon/public key</li>
                    <li>Update the .env file with your actual credentials</li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary to-primary-400">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container-custom py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Achetez et vendez
              <span className="block text-primary-100">à Daloa</span>
            </h1>
            <p className="text-white text-xl md:text-2xl opacity-95 mb-10 max-w-3xl mx-auto leading-relaxed">
              La première marketplace P2P de Daloa. Trouvez des articles d'occasion près de chez vous ou vendez ce dont vous n'avez plus besoin.
            </p>
            
            {userProfile && (!userProfile.full_name || !userProfile.phone || !userProfile.district) && (
              <div className="mb-8 p-4 bg-warning-100 border border-warning-300 rounded-2xl max-w-md mx-auto">
                <p className="text-warning-800 font-medium mb-3">Profil incomplet</p>
                <Link to="/complete-profile" className="btn-primary bg-warning-600 hover:bg-warning-700 border-warning-600">
                  Compléter mon profil
                </Link>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link to="/search" className="btn-secondary bg-white text-primary hover:bg-grey-100 flex-1 py-4 text-lg font-semibold">
                Parcourir
              </Link>
              <Link to="/create-listing" className="btn-primary bg-secondary hover:bg-secondary-600 flex-1 py-4 text-lg font-semibold">
                Vendre
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white shadow-lg relative z-10 -mt-8 mx-4 rounded-3xl">
        <div className="container-custom">
          <SearchBar className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-grey-900 mb-2">500+</h3>
              <p className="text-grey-600">Annonces publiées</p>
            </div>
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-grey-900 mb-2">200+</h3>
              <p className="text-grey-600">Utilisateurs actifs</p>
            </div>
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-success-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-grey-900 mb-2">100%</h3>
              <p className="text-grey-600">Transactions sécurisées</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-grey-900 mb-4">Explorez par catégorie</h2>
            <p className="text-xl text-grey-600 max-w-2xl mx-auto">Trouvez exactement ce que vous cherchez dans nos différentes catégories</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/search?category=${category.id}`}
                className="group bg-gradient-to-br from-grey-50 to-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-center border border-grey-100 hover:border-primary-200 transform hover:-translate-y-1"
              >
                <div className="h-16 w-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-grey-900 text-sm leading-tight group-hover:text-primary transition-colors">
                  {category.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-16 bg-gradient-to-br from-grey-50 to-grey-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-grey-900 mb-2">Dernières annonces</h2>
              <p className="text-xl text-grey-600">Découvrez les nouveautés de la communauté</p>
            </div>
            <Link to="/search" className="mt-4 md:mt-0 text-primary font-semibold flex items-center hover:text-primary-700 transition-colors text-lg">
              Voir tout 
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="large" />
            </div>
          ) : latestListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {latestListings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  sellerName={listing.seller_name}
                  sellerRating={listing.seller_rating}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-2xl mx-auto">
              <ShoppingBag className="h-20 w-20 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Aucune annonce pour le moment</h3>
              <p className="text-grey-600 mb-8 text-lg">Soyez le premier à publier une annonce sur DaloaMarket !</p>
              <Link to="/create-listing" className="btn-primary text-lg px-8 py-4">
                Publier une annonce
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-grey-900 mb-4">Comment ça marche</h2>
            <p className="text-xl text-grey-600 max-w-3xl mx-auto">Vendez et achetez en toute simplicité en 3 étapes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="h-24 w-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl font-bold text-primary">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Créez votre annonce</h3>
              <p className="text-grey-600 text-lg leading-relaxed">
                Prenez des photos, décrivez votre article et fixez votre prix. La publication coûte seulement 200 FCFA.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="h-24 w-24 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl font-bold text-secondary">2</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Discutez avec les acheteurs</h3>
              <p className="text-grey-600 text-lg leading-relaxed">
                Recevez des messages des personnes intéressées et répondez directement via notre messagerie sécurisée.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="h-24 w-24 bg-gradient-to-br from-success-100 to-success-200 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-3xl font-bold text-success">3</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Vendez en toute simplicité</h3>
              <p className="text-grey-600 text-lg leading-relaxed">
                Rencontrez l'acheteur dans votre quartier et finalisez la vente en personne, en toute sécurité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary via-secondary-600 to-secondary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container-custom text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Prêt à vendre vos articles ?
          </h2>
          <p className="text-white opacity-95 max-w-3xl mx-auto mb-10 text-xl leading-relaxed">
            Rejoignez la communauté DaloaMarket et commencez à vendre dès aujourd'hui. C'est simple, rapide et sécurisé !
          </p>
          <Link to="/create-listing" className="btn-primary bg-white text-secondary hover:bg-grey-100 text-xl px-10 py-5 font-semibold">
            Publier une annonce
          </Link>
        </div>
      </section>

      {/* Credits Display */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3 border border-primary-200">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="font-semibold text-grey-700">Crédits:</span>
            <span className="text-2xl font-bold text-primary">
              {userCredits !== null ? userCredits : <LoadingSpinner size="small" />}
            </span>
            <Link to="/acheter-credits" className="btn-primary py-2 px-4 text-sm ml-2">
              Acheter
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;