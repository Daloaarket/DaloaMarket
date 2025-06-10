import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ListingCard from '../../components/listings/ListingCard';
import { CATEGORIES, CONDITIONS, DISTRICTS } from '../../lib/utils';
import { Database } from '../../lib/database.types';
import Toast from 'react-native-toast-message';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingWithSeller = Listing & { seller_name: string; seller_rating: number | null };

interface FilterState {
  category: string;
  condition: string;
  district: string;
  minPrice: string;
  maxPrice: string;
}

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filters, setFilters] = useState<FilterState>({
    category: (params.category as string) || '',
    condition: (params.condition as string) || '',
    district: (params.district as string) || '',
    minPrice: (params.minPrice as string) || '',
    maxPrice: (params.maxPrice as string) || '',
  });

  useEffect(() => {
    fetchListings();
  }, [searchQuery, filters]);

  const fetchListings = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          users:user_id (
            full_name,
            rating
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      
      if (filters.district) {
        query = query.eq('district', filters.district);
      }
      
      if (filters.minPrice) {
        query = query.gte('price', parseInt(filters.minPrice));
      }
      
      if (filters.maxPrice) {
        query = query.lte('price', parseInt(filters.maxPrice));
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const formattedListings = data.map(item => ({
        ...item,
        seller_name: item.users?.full_name || 'Utilisateur',
        seller_rating: item.users?.rating || null
      }));
      
      setListings(formattedListings);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching listings:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les annonces'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
    fetchListings();
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      condition: '',
      district: '',
      minPrice: '',
      maxPrice: '',
    });
    setIsFilterOpen(false);
  };

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  const renderListingItem = ({ item }: { item: ListingWithSeller }) => (
    <ListingCard
      listing={item}
      onPress={() => handleListingPress(item.id)}
      sellerName={item.seller_name}
      sellerRating={item.seller_rating}
    />
  );

  return (
    <View className="flex-1 bg-grey-50">
      {/* Search Header */}
      <View className="bg-white px-6 py-4 border-b border-grey-200">
        <View className="flex-row items-center space-x-3">
          <View className="flex-1 flex-row bg-grey-100 rounded-xl px-4 py-3">
            <TextInput
              className="flex-1 text-base"
              placeholder="Rechercher..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Ionicons name="search" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            className="bg-primary rounded-xl p-3"
            onPress={() => setIsFilterOpen(true)}
          >
            <Ionicons name="options" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-grey-600 mt-2">
          {totalCount} résultat{totalCount !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : listings.length > 0 ? (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderListingItem}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="search-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-bold mt-4 mb-2">Aucune annonce trouvée</Text>
          <Text className="text-grey-600 text-center mb-6">
            Essayez de modifier votre recherche ou vos filtres
          </Text>
          <TouchableOpacity 
            className="bg-primary rounded-2xl py-3 px-6"
            onPress={resetFilters}
          >
            <Text className="text-white font-semibold">Réinitialiser les filtres</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={isFilterOpen}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-6 border-b border-grey-200">
            <Text className="text-xl font-bold">Filtres</Text>
            <TouchableOpacity onPress={() => setIsFilterOpen(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-6">
            {/* Category Filter */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3">Catégorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-full border ${
                      filters.category === '' ? 'bg-primary border-primary' : 'border-grey-300'
                    }`}
                    onPress={() => setFilters(prev => ({ ...prev, category: '' }))}
                  >
                    <Text className={filters.category === '' ? 'text-white' : 'text-grey-700'}>
                      Toutes
                    </Text>
                  </TouchableOpacity>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      className={`px-4 py-2 rounded-full border ${
                        filters.category === category.id ? 'bg-primary border-primary' : 'border-grey-300'
                      }`}
                      onPress={() => setFilters(prev => ({ ...prev, category: category.id }))}
                    >
                      <Text className={filters.category === category.id ? 'text-white' : 'text-grey-700'}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Condition Filter */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3">État</Text>
              <View className="flex-row flex-wrap gap-3">
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full border ${
                    filters.condition === '' ? 'bg-primary border-primary' : 'border-grey-300'
                  }`}
                  onPress={() => setFilters(prev => ({ ...prev, condition: '' }))}
                >
                  <Text className={filters.condition === '' ? 'text-white' : 'text-grey-700'}>
                    Tous
                  </Text>
                </TouchableOpacity>
                {CONDITIONS.map((condition) => (
                  <TouchableOpacity
                    key={condition.id}
                    className={`px-4 py-2 rounded-full border ${
                      filters.condition === condition.id ? 'bg-primary border-primary' : 'border-grey-300'
                    }`}
                    onPress={() => setFilters(prev => ({ ...prev, condition: condition.id }))}
                  >
                    <Text className={filters.condition === condition.id ? 'text-white' : 'text-grey-700'}>
                      {condition.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3">Prix (FCFA)</Text>
              <View className="flex-row space-x-3">
                <TextInput
                  className="flex-1 border border-grey-300 rounded-xl px-4 py-3"
                  placeholder="Prix min"
                  value={filters.minPrice}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                  keyboardType="numeric"
                />
                <TextInput
                  className="flex-1 border border-grey-300 rounded-xl px-4 py-3"
                  placeholder="Prix max"
                  value={filters.maxPrice}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          {/* Filter Actions */}
          <View className="p-6 border-t border-grey-200">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 border border-grey-300 rounded-xl py-3 items-center"
                onPress={resetFilters}
              >
                <Text className="text-grey-700 font-semibold">Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl py-3 items-center"
                onPress={applyFilters}
              >
                <Text className="text-white font-semibold">Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}