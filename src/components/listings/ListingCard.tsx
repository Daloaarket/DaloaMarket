import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/utils';
import { Database } from '../../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface ListingCardProps {
  listing: Listing;
  sellerName?: string;
  sellerRating?: number | null;
}

const ListingCard: React.FC<ListingCardProps> = ({ 
  listing
}) => {
  // Utiliser la première photo comme image principale
  const mainImage = listing.photos && listing.photos.length > 0 
    ? listing.photos[0] 
    : 'https://via.placeholder.com/223x223?text=Pas+d%27image';

  return (
    <Link 
      to={`/listings/${listing.id}`} 
      className="block bg-white rounded-card shadow-card overflow-hidden hover:shadow-lg transition-shadow"
      style={{ width: '231.5px', height: '301.5px', minWidth: '231.5px' }}
    >
      {/* Image */}
      <div className="flex justify-center items-center" style={{ width: '231.5px', height: '223.5px' }}>
        <img 
          src={mainImage} 
          alt={listing.title} 
          style={{ width: '223.5px', height: '223.5px', objectFit: 'cover', borderRadius: '8px' }}
        />
        {listing.boosted_until && new Date(listing.boosted_until) > new Date() && (
          <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded-full">
            Sponsorisé
          </div>
        )}
      </div>
      {/* Nom et prix en bas */}
      <div className="flex flex-col justify-end h-[78px] px-3 pb-4 pt-2">
        <h3 className="text-base font-semibold text-grey-900 line-clamp-1 mb-1">{listing.title}</h3>
        <p className="text-lg font-bold text-primary">{formatPrice(listing.price)}</p>
      </div>
    </Link>
  );
};

export default ListingCard;