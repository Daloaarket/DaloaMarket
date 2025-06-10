import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice, formatDate } from '../../lib/utils';
import { Database } from '../../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
  sellerName?: string;
  sellerRating?: number | null;
}

export const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  onPress,
  sellerName,
  sellerRating 
}) => {
  const mainImage = listing.photos && listing.photos.length > 0 
    ? listing.photos[0] 
    : 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=400';

  const isBoostActive = listing.boosted_until && new Date(listing.boosted_until) > new Date();

  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden border border-grey-100"
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View className="relative">
        <Image 
          source={{ uri: mainImage }}
          className="w-full h-48"
          resizeMode="cover"
        />
        
        {/* Boost Badge */}
        {isBoostActive && (
          <View className="absolute top-3 left-3 bg-primary rounded-full px-3 py-1 flex-row items-center">
            <Ionicons name="flash\" size={12} color="white" />
            <Text className="text-white text-xs font-bold ml-1">Sponsorisé</Text>
          </View>
        )}

        {/* Status Badge */}
        {listing.status === 'sold' && (
          <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
            <View className="bg-red-600 px-4 py-2 rounded-full">
              <Text className="text-white font-bold text-sm">VENDU</Text>
            </View>
          </View>
        )}

        {/* Photo Count */}
        {listing.photos && listing.photos.length > 1 && (
          <View className="absolute top-3 right-3 bg-black bg-opacity-60 rounded-full px-2 py-1">
            <Text className="text-white text-xs">{listing.photos.length} photos</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Title and Price */}
        <Text className="font-semibold text-grey-900 text-base mb-2" numberOfLines={2}>
          {listing.title}
        </Text>
        <Text className="text-2xl font-bold text-primary mb-3">
          {formatPrice(listing.price)}
        </Text>

        {/* Location and Date */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center flex-1">
            <Ionicons name="location-outline" size={16} color="#9CA3AF" />
            <Text className="text-grey-600 text-sm ml-1" numberOfLines={1}>
              {listing.district}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#9CA3AF" />
            <Text className="text-grey-600 text-sm ml-1">
              {formatDate(listing.created_at)}
            </Text>
          </View>
        </View>

        {/* Seller Info */}
        {sellerName && (
          <View className="flex-row justify-between items-center pt-3 border-t border-grey-100">
            <Text className="text-grey-600 text-sm" numberOfLines={1}>
              {sellerName}
            </Text>
            {sellerRating && (
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#FF7F00" />
                <Text className="text-sm font-medium ml-1">
                  {sellerRating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ListingCard;