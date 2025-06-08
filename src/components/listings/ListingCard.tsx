import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Zap } from 'lucide-react';
import { formatPrice, formatDate } from '../../lib/utils';
import { Database } from '../../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface ListingCardProps {
  listing: Listing;
  sellerName?: string;
  sellerRating?: number | null;
}

const ListingCard: React.FC<ListingCardProps> = ({ 
  listing,
  sellerName,
  sellerRating
}) => {
  const mainImage = listing.photos && listing.photos.length > 0 
    ? listing.photos[0] 
    : 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=400';

  const isBoostActive = listing.boosted_until && new Date(listing.boosted_until) > new Date();

  return (
    <Link 
      to={`/listings/${listing.id}`} 
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-grey-100 hover:border-primary-200 transform hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-grey-100">
        <img 
          src={mainImage} 
          alt={listing.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Boost Badge */}
        {isBoostActive && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-primary to-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg">
            <Zap className="h-3 w-3 mr-1 fill-current" />
            Sponsorisé
          </div>
        )}

        {/* Status Badge */}
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-error-600 text-white px-4 py-2 rounded-full font-bold text-sm">
              VENDU
            </span>
          </div>
        )}

        {/* Photo Count */}
        {listing.photos && listing.photos.length > 1 && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
            {listing.photos.length} photos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Price */}
        <div className="space-y-2">
          <h3 className="font-semibold text-grey-900 line-clamp-2 text-base leading-tight group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(listing.price)}
          </p>
        </div>

        {/* Location and Date */}
        <div className="flex items-center justify-between text-sm text-grey-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-grey-400" />
            <span className="truncate">{listing.district}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-grey-400" />
            <span>{formatDate(listing.created_at)}</span>
          </div>
        </div>

        {/* Seller Info */}
        {sellerName && (
          <div className="flex items-center justify-between pt-2 border-t border-grey-100">
            <span className="text-sm text-grey-600 truncate">{sellerName}</span>
            {sellerRating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-primary fill-current" />
                <span className="text-sm font-medium ml-1">{sellerRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;