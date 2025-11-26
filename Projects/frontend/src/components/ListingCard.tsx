import React from 'react';
import { Link } from 'react-router-dom';

export interface Listing {
  id: number;
  type: 'property' | 'project' | 'land';
  name: string;
  price?: number | null;
  image_urls?: string[];
  location_city?: string;
  location_neighborhood?: string;
  sq_ft_or_area?: number | null;
  details?: string;
}

export interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const imageUrl = listing.image_urls && listing.image_urls.length > 0 
    ? listing.image_urls[0] 
    : 'https://via.placeholder.com/300x200?text=No+Image';

  const detailPath = listing.type === 'property' 
    ? `/property/${listing.id}` 
    : listing.type === 'project' 
    ? `/project/${listing.id}` 
    : `/land/${listing.id}`;

  return (
    <Link to={detailPath}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer">
        <img 
          src={imageUrl} 
          alt={listing.name} 
          className="w-full h-48 object-cover"
          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image')}
        />
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{listing.name}</h3>
          <p className="text-gray-600 text-sm mb-2">
            {listing.location_city && listing.location_neighborhood 
              ? `${listing.location_city}, ${listing.location_neighborhood}` 
              : 'Location TBD'}
          </p>
          <p className="text-blue-600 font-bold mb-1">
            {listing.price ? `$${listing.price.toLocaleString()}` : 'Price TBD'}
          </p>
          <p className="text-gray-500 text-xs">
            {listing.sq_ft_or_area && `${listing.sq_ft_or_area} sq ft`}
          </p>
        </div>
      </div>
    </Link>
  );
};
