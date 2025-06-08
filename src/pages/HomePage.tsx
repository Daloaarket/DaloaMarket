import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
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

  // Récupérer le solde de crédits à l'ouverture
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

  // Afficher une notification après achat de crédits
  useEffect(() => {
    if (localStorage.getItem('credit_purchase_pending')) {
      toast.success('Crédits ajoutés à votre compte !');
      localStorage.removeItem('credit_purchase_pending');
    }
  }, []);

  // Show configuration warning if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="pb-12">
        {/* Configuration Warning */}
        <section className="py-12 bg-warning-50">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <AlertCircle className="h-16 w-16 text-warning-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-warning-800 mb-4">Configuration Required</h2>
              <p className="text-warning-700 mb-6">
                To use DaloaMarket, you need to configure your Supabase database connection.
              </p>
              <div className="bg-white rounded-lg p-6 text-left">
                <h3 className="font-semibold mb-3">Setup Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">supabase.com</a> and create a new project</li>
                  <li>In your Supabase dashboard, go to Settings → API</li>
                  <li>Copy your Project URL and anon/public key</li>
                  <li>Update the .env file with your actual credentials</li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary-600 to-primary py-12 md:py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Achetez et vendez à Daloa
            </h1>
            <p className="text-white text-lg md:text-xl opacity-90 mb-8">
              La première marketplace P2P de Daloa. Trouvez des articles d'occasion près de chez vous ou vendez ce dont vous n'avez plus besoin.
            </p>
            {userProfile && (!userProfile.full_name || !userProfile.phone || !userProfile.district) && (
              <div className="mb-6">
                <Link to="/complete-profile" className="btn-warning">
                  Compléter mon profil
                </Link>
                <p className="text-warning-100 mt-2 text-sm">Votre profil est incomplet. Certaines fonctionnalités sont limitées.</p>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/search" className="btn-secondary bg-white text-primary hover:bg-grey-100">
                Parcourir les annonces
              </Link>
              <Link to="/create-listing" className="btn-primary bg-secondary hover:bg-secondary-600">
                Vendre un article
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container-custom">
          <SearchBar className="max-w-3xl mx-auto" />
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-grey-900 mb-6">Catégories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/search?category=${category.id}`}
                className="bg-white rounded-card shadow-sm hover:shadow-md transition-shadow p-4 text-center"
              >
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-grey-900">{category.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-12 bg-grey-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-grey-900">Dernières annonces</h2>
            <Link to="/search" className="text-primary font-medium flex items-center hover:underline">
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : latestListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            <div className="bg-white rounded-card shadow-card p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune annonce pour le moment</h3>
              <p className="text-grey-600 mb-6">Soyez le premier à publier une annonce sur DaloaMarket !</p>
              <Link to="/create-listing" className="btn-primary">
                Publier une annonce
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-grey-900 mb-8 text-center">Comment ça marche</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-card shadow-card p-6 text-center">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Créez votre annonce</h3>
              <p className="text-grey-600">
                Prenez des photos, décrivez votre article et fixez votre prix. La publication coûte seulement 200 FCFA.
              </p>
            </div>
            
            <div className="bg-white rounded-card shadow-card p-6 text-center">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Discutez avec les acheteurs</h3>
              <p className="text-grey-600">
                Recevez des messages des personnes intéressées et répondez directement via notre messagerie sécurisée.
              </p>
            </div>
            
            <div className="bg-white rounded-card shadow-card p-6 text-center">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Vendez en toute simplicité</h3>
              <p className="text-grey-600">
                Rencontrez l'acheteur dans votre quartier et finalisez la vente en personne, en toute sécurité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-secondary">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Prêt à vendre vos articles ?
          </h2>
          <p className="text-white opacity-90 max-w-2xl mx-auto mb-8">
            Rejoignez la communauté DaloaMarket et commencez à vendre dès aujourd'hui. C'est simple, rapide et sécurisé !
          </p>
          <Link to="/create-listing" className="btn-primary bg-white text-secondary hover:bg-grey-100">
            Publier une annonce
          </Link>
        </div>
      </section>

      {/* Affichage du solde de crédits si connecté */}
      {user && (
        <div className="container-custom mt-6 mb-2 flex justify-end">
          <div className="bg-white rounded-card shadow-card px-4 py-2 flex items-center gap-2 text-primary font-semibold">
            <span>Crédits&nbsp;:</span>
            <span className="text-lg">{userCredits !== null ? userCredits : <LoadingSpinner size="small" />}</span>
            <Link to="/acheter-credits" className="ml-3 btn-secondary btn-xs">Acheter des crédits</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;