import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ListingCard from '../../components/listings/ListingCard';
import { CATEGORIES } from '../../lib/utils';
import { Database } from '../../lib/database.types';
import Toast from 'react-native-toast-message';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingWithSeller = Listing & { seller_name: string; seller_rating: number | null };

export default function HomeScreen() {
  const { user, userProfile } = useAuth();
  const [latestListings, setLatestListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLatestListings();
  }, []);

  const fetchLatestListings = async () => {
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
        .limit(10);

      if (error) throw error;

      const formattedListings = data.map(item => ({
        ...item,
        seller_name: item.users?.full_name || 'Utilisateur',
        seller_rating: item.users?.rating || null
      }));

      setLatestListings(formattedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les annonces'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLatestListings();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/search?category=${categoryId}`);
  };

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView 
      className="flex-1 bg-grey-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Section */}
      <View className="bg-gradient-to-br from-primary to-primary-600 px-6 py-8">
        <Text className="text-white text-3xl font-bold mb-2">
          Achetez et vendez
        </Text>
        <Text className="text-primary-100 text-3xl font-bold mb-4">
          à Daloa
        </Text>
        <Text className="text-white text-lg opacity-90 mb-6">
          La première marketplace P2P de Daloa
        </Text>

        {/* Search Bar */}
        <View className="flex-row bg-white rounded-2xl p-3 shadow-lg">
          <TextInput
            className="flex-1 text-base px-3"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            className="bg-primary rounded-xl px-4 py-2"
            onPress={handleSearch}
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Alert */}
      {user && userProfile && (!userProfile.full_name || !userProfile.phone || !userProfile.district) && (
        <View className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-4 rounded-lg">
          <Text className="text-yellow-800 font-medium mb-2">Profil incomplet</Text>
          <TouchableOpacity 
            className="bg-yellow-600 rounded-lg py-2 px-4 self-start"
            onPress={() => router.push('/auth/complete-profile')}
          >
            <Text className="text-white font-medium">Compléter mon profil</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Categories */}
      <View className="px-6 py-6">
        <Text className="text-2xl font-bold text-grey-900 mb-4">
          Explorez par catégorie
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-4">
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-grey-100 min-w-[120px] items-center"
                onPress={() => handleCategoryPress(category.id)}
              >
                <View className="bg-primary-100 rounded-2xl p-3 mb-3">
                  <Ionicons name="storefront" size={24} color="#FF7F00" />
                </View>
                <Text className="font-semibold text-grey-900 text-center text-sm">
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Latest Listings */}
      <View className="px-6 pb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-grey-900">
            Dernières annonces
          </Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text className="text-primary font-semibold">Voir tout</Text>
          </TouchableOpacity>
        </View>

        {latestListings.length > 0 ? (
          <FlatList
            data={latestListings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListingCard
                listing={item}
                onPress={() => handleListingPress(item.id)}
                sellerName={item.seller_name}
                sellerRating={item.seller_rating}
              />
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="bg-white rounded-3xl shadow-lg p-8 items-center">
            <Ionicons name="storefront-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-bold mb-2 mt-4">Aucune annonce</Text>
            <Text className="text-grey-600 text-center mb-6">
              Soyez le premier à publier une annonce !
            </Text>
            <TouchableOpacity 
              className="bg-primary rounded-2xl py-3 px-6"
              onPress={() => router.push('/create')}
            >
              <Text className="text-white font-semibold">Publier une annonce</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}