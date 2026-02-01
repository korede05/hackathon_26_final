import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { Heart, X, RotateCcw, Home, MapPin, Info } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Listing {
  id: string;
  title: string;
  price_max: number;
  price_min: number;
  address: string;
  cover_photo_url: string;
  description: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
}

export const BrowsePage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  //const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    //setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .limit(20);

    if (error) {
      toast.error("Could not load homes");
    } else {
      setListings(data || []);
    }
    //setLoading(false);
  };

  const handleAction = async (action: "like" | "dislike") => {
    // Set animation direction
    setSwipeDirection(action === 'like' ? 'right' : 'left');
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentListing = listings[currentIndex];
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
      return;
    }

    if (action === "like") {
      const { error } = await supabase.from("likes").insert({
        user_id: user.id,
        listing_id: currentListing.id,
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("Already in your listings!");
        } else {
          toast.error("Failed to save home");
        }
      } else {
        toast.success("Saved to Listings!");
      }
    }

    // Move to next card and reset animation
    setCurrentIndex((prev) => prev + 1);
    setSwipeDirection(null);
  };

  // if (loading) {
  //   return (
  //     <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
  //         <p className="font-bold text-white text-xl">Finding homes...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (currentIndex >= listings.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <RotateCcw className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No more homes nearby!</h2>
          <p className="text-gray-500 mb-6">You've seen everything in your area for now.</p>
          <button 
            onClick={() => setCurrentIndex(0)}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Restart Feed
          </button>
        </div>
      </div>
    );
  }

  const currentHome = listings[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-500 pt-4 pb-32">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 py-4 shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-500 rounded-full p-2">
            <Home className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Content - Fixed centered position */}
      <div className="fixed inset-0 flex items-center justify-center pt-20 pb-32">
        <div className="w-full max-w-md px-6">
          {/* Property Card - Fixed position with fade out animation */}
          <div 
            className={`bg-white rounded-3xl overflow-hidden shadow-2xl w-full mb-8 transition-all duration-300 ${
              swipeDirection === 'left' 
                ? 'opacity-0 -translate-x-full' 
                : swipeDirection === 'right'
                ? 'opacity-0 translate-x-full'
                : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Swipe indicator overlays */}
            {swipeDirection === 'left' && (
              <div className="absolute inset-0 bg-red-500/20 z-10 flex items-center justify-center">
                <div className="bg-white rounded-full p-4 shadow-xl">
                  <X className="w-16 h-16 text-red-500" strokeWidth={4} />
                </div>
              </div>
            )}

            {swipeDirection === 'right' && (
              <div className="absolute inset-0 bg-green-500/20 z-10 flex items-center justify-center">
                <div className="bg-white rounded-full p-4 shadow-xl">
                  <Heart className="w-16 h-16 text-green-500 fill-green-500" strokeWidth={4} />
                </div>
              </div>
            )}

            {/* Image */}
            <div className="relative h-80">
              <img 
                src={currentHome.cover_photo_url || "https://images.unsplash.com/photo-1518780664697-55e3ad937233"} 
                alt={currentHome.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info Section */}
            <div className="p-6">
              {/* Price */}
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                ${currentHome.price_max.toLocaleString()}
              </h1>

              {/* Title - with fade effect */}
              <div className="relative mb-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {currentHome.title}
                </p>
              </div>

              {/* Bed/Bath/Sqft Stats */}
              <div className="flex items-center gap-6 text-lg font-semibold text-gray-800 mb-4">
                <div className="flex items-center gap-2">
                  <span>{currentHome.bedrooms || 0}</span>
                  <span className="text-sm text-gray-500 font-normal">beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{currentHome.bathrooms || 0}</span>
                  <span className="text-sm text-gray-500 font-normal">baths</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{currentHome.sqft?.toLocaleString() || '--'}</span>
                  <span className="text-sm text-gray-500 font-normal">sqft</span>
                </div>
              </div>

              {/* Description - with fade effect */}
              <div className="relative">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {currentHome.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Pass button */}
            <button 
              onClick={() => handleAction("dislike")}
              disabled={swipeDirection !== null}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            >
              <X className="w-8 h-8 text-red-500" strokeWidth={3} />
            </button>
            
            {/* Info button */}
            <button 
              onClick={() => navigate(`/listing/${currentHome.id}`)}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Info className="w-6 h-6 text-gray-400" />
            </button>

            {/* Like button */}
            <button 
              onClick={() => handleAction("like")}
              disabled={swipeDirection !== null}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            >
              <Heart className="w-8 h-8 fill-green-500 text-green-500" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};