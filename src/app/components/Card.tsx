
import React from 'react';
// Import the type you defined in your data folder
import { ListingFeedRow } from '../../data/listings'; 
import { MapPin, Bed, Bath, Ruler, Wifi, Wind, Zap, Droplets } from 'lucide-react';

interface CardProps {
  listing: ListingFeedRow;
}

export const PropertyCard: React.FC<CardProps> = ({ listing }) => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 w-full max-w-sm mx-auto h-[600px] flex flex-col relative">
      
      {/* 1. Image Section */}
      <div className="h-3/5 relative">
        <img 
          src={listing.cover_photo_url || 'https://via.placeholder.com/400x600?text=No+Photo'} 
          className="w-full h-full object-cover"
          alt={listing.title}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 pt-20">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-white text-2xl font-bold">{listing.title}</h2>
              {listing.housing_category && (
  <span className="inline-flex mt-2 items-center px-2 py-1 rounded-full text-[10px] font-bold bg-white/90 text-gray-900 uppercase tracking-wide">
    {listing.housing_category}
  </span>
)}
              <p className="text-blue-100 flex items-center gap-1 text-sm mt-1">
                <MapPin className="w-3 h-3" /> {listing.city}, {listing.state}
              </p>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-2xl shadow-lg">
              <p className="text-blue-600 font-bold text-lg">${listing.price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl">
            <Bed className="w-4 h-4 text-gray-400 mb-1" />
            <span className="text-[10px] font-bold text-gray-700">{listing.bedrooms || 0} Bed</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl">
            <Bath className="w-4 h-4 text-gray-400 mb-1" />
            <span className="text-[10px] font-bold text-gray-700">{listing.bathrooms || 0} Bath</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl">
            <Ruler className="w-4 h-4 text-gray-400 mb-1" />
            <span className="text-[10px] font-bold text-gray-700">{listing.sqft || '--'} sqft</span>
          </div>
        </div>

        {/* Utilities Row (Safe from Null Errors) */}
        <div className="flex gap-4 py-3 border-y border-gray-50 my-2">
          {listing.wifi && <span title="Wifi"><Wifi className="w-5 h-5 text-blue-500" /></span>}
          {listing.ac && <span title="AC"><Wind className="w-5 h-5 text-cyan-500" /></span>}
          {listing.electricity && <span title="Electricity Included"><Zap className="w-5 h-5 text-yellow-500" /></span>}
          {listing.water && <span title="Water Included"><Droplets className="w-5 h-5 text-blue-400" /></span>}
        </div>

        {/* Description Section */}
        <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">
          {listing.description || "No description provided for this listing."}
        </p>

        {/* Owner Attribution */}
        {listing.owner && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
            <div className="w-5 h-5 bg-gray-200 rounded-full overflow-hidden">
               {listing.owner.avatar_url && <img src={listing.owner.avatar_url} alt="owner" />}
            </div>
            <span className="text-[10px] text-gray-400">Listed by {listing.owner.display_name}</span>
          </div>
        )}
      </div>
    </div>
  );
};