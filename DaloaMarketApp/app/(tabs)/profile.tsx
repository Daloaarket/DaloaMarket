import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ListingCard from '../../components/listings/ListingCard';
import { formatPhoneNumber, formatDate } from '../../lib/utils';
import { Database } from '../../lib/database.types';
import Toast from 'react-native-toast-message';

type Listing = Database['public']['Tables']['listings']['Row'];

export default function ProfileScreen() {
  const { user, userProfile, signOut } = useAuth();
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  useEffect(() => {
    if (!user) return;
    
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (listingsError) throw listingsError;
      
      setUserListings(listings || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les données'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Toast.show({
                type: 'success',
                text1: 'Déconnexion réussie'
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Erreur lors de la déconnexion'
              });
            }
          }
        },
      ]
    );
  };

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <ListingCard
      listing={item}
      onPress={() => handleListingPress(item.id)}
    />
  );

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-grey-50 px-6">
        <Ionicons name="person-outline" size={64} color="#9CA3AF" />
        <Text className="text-xl font-bold mt-4 mb-2">Connexion requise</Text>
        <Text className="text-grey-600 text-center mb-6">
          Connectez-vous pour accéder à votre profil
        </Text>
        <TouchableOpacity 
          className="bg-primary rounded-2xl py-3 px-6"
          onPress={() => router.push('/auth/login')}
        >
          <Text className="text-white font-semibold">Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-grey-50 px-6">
        <Ionicons name="person-add-outline" size={64} color="#9CA3AF" />
        <Text className="text-xl font-bold mt-4 mb-2">Profil incomplet</Text>
        <Text className="text-grey-600 text-center mb-6">
          Complétez votre profil pour accéder à toutes les fonctionnalités
        </Text>
        <TouchableOpacity 
          className="bg-primary rounded-2xl py-3 px-6"
          onPress={() => router.push('/auth/complete-profile')}
        >
          <Text className="text-white font-semibold">Compléter mon profil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView className="flex-1 bg-grey-50">
      {/* Profile Header */}
      <View className="bg-white p-6 border-b border-grey-200">
        <View className="items-center mb-6">
          <View className="bg-primary-100 rounded-full p-6 mb-4">
            <Ionicons name="person" size={48} color="#FF7F00" />
          </View>
          
          <Text className="text-2xl font-bold text-grey-900 mb-1">
            {userProfile.full_name}
          </Text>
          
          <Text className="text-grey-600 mb-2">{user.email}</Text>
          
          {userProfile.rating && (
            <View className="flex-row items-center mb-2">
              <Ionicons name="star" size={20} color="#FF7F00" />
              <Text className="ml-1 font-medium">{userProfile.rating.toFixed(1)}</Text>
            </View>
          )}
          
          <Text className="text-grey-500 text-sm">
            Membre depuis {formatDate(userProfile.created_at)}
          </Text>
        </View>

        {/* Profile Info */}
        <View className="space-y-4 mb-6">
          <View className="flex-row items-center">
            <Ionicons name="call" size={20} color="#6B7280" />
            <Text className="ml-3 text-grey-700">
              {formatPhoneNumber(userProfile.phone)}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="location" size={20} color="#6B7280" />
            <Text className="ml-3 text-grey-700">{userProfile.district}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <TouchableOpacity 
            className="bg-primary rounded-xl py-3 flex-row items-center justify-center"
            onPress={() => router.push('/auth/settings')}
          >
            <Ionicons name="settings" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Modifier le profil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="border border-red-300 rounded-xl py-3 flex-row items-center justify-center"
            onPress={handleSignOut}
          >
            <Ionicons name="log-out" size={20} color="#DC2626" />
            <Text className="text-red-600 font-semibold ml-2">Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-grey-200">
        <View className="flex-row">
          <TouchableOpacity
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === 'listings' ? 'border-primary' : 'border-transparent'
            }`}
            onPress={() => setActiveTab('listings')}
          >
            <Text className={`font-medium ${
              activeTab === 'listings' ? 'text-primary' : 'text-grey-600'
            }`}>
              Mes annonces
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === 'reviews' ? 'border-primary' : 'border-transparent'
            }`}
            onPress={() => setActiveTab('reviews')}
          >
            <Text className={`font-medium ${
              activeTab === 'reviews' ? 'text-primary' : 'text-grey-600'
            }`}>
              Avis reçus
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <View className="p-6">
        {activeTab === 'listings' && (
          userListings.length > 0 ? (
            <FlatList
              data={userListings}
              keyExtractor={(item) => item.id}
              renderItem={renderListingItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="items-center py-12">
              <Ionicons name="storefront-outline" size={64} color="#9CA3AF" />
              <Text className="text-xl font-bold mt-4 mb-2">Aucune annonce</Text>
              <Text className="text-grey-600 text-center mb-6">
                Vous n'avez pas encore publié d'annonces
              </Text>
              <TouchableOpacity 
                className="bg-primary rounded-2xl py-3 px-6"
                onPress={() => router.push('/create')}
              >
                <Text className="text-white font-semibold">Publier une annonce</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {activeTab === 'reviews' && (
          <View className="items-center py-12">
            <Ionicons name="star-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-bold mt-4 mb-2">Aucun avis</Text>
            <Text className="text-grey-600 text-center">
              Vous n'avez pas encore reçu d'avis
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}