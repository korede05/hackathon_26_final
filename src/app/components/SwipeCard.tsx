import React, { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { PropertyCard } from './Card';
import { X, Heart, RotateCcw, Info, Home } from 'lucide-react';

export const SwipeInterface: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      // Pulling active listings from your database
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active');
      
      if (data) setListings(data);
      setLoading(false);
    };
    fetchListings();
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    // Here you can add logic to save likes/dislikes to a 'likes' table
    console.log(`Swiped ${direction} on:`, listings[currentIndex].title);
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold text-white text-xl">Loading listings...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= listings.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="bg-orange-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <RotateCcw className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">End of the line!</h2>
          <p className="text-gray-500 mb-6">No more listings matching your criteria.</p>
          <button 
            onClick={() => setCurrentIndex(0)}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Reset Deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Logo + Name (like login page) */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <Home className="w-10 h-10 text-orange-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">HomeSwipe</h1>
          
          {/* Progress counter */}
          <span className="inline-block mt-3 text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white">
            {currentIndex + 1} / {listings.length}
          </span>
        </div>

        {/* Card Container with Animation */}
        <div className="animate-in fade-in zoom-in duration-300 mb-8">
          <PropertyCard listing={listings[currentIndex]} />
        </div>

        {/* Swipe Controls */}
        <div className="flex items-center justify-center gap-8">
          {/* Pass button - Red */}
          <button 
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl text-red-500 hover:scale-110 active:scale-95 transition-all"
          >
            <X className="w-8 h-8" strokeWidth={3} />
          </button>
          
          {/* Info button - Gradient */}
          <button className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-md text-white hover:scale-105 active:scale-95 transition-all">
            <Info className="w-6 h-6" />
          </button>

          {/* Like button - Gradient */}
          <button 
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl text-white hover:scale-110 active:scale-95 transition-all"
          >
            <Heart className="w-8 h-8 fill-white" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};