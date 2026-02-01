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
  housing_category?: string;
}

export const BrowsePage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showingDislikes, setShowingDislikes] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async (includeDislikes = false) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .limit(20);

      if (error) {
        console.error("Error fetching listings:", error);
        toast.error("Could not load homes");
      } else {
        setListings(data || []);
      }
      setLoading(false);
      return;
    }

    if (includeDislikes) {
      const { data: interactions } = await supabase
        .from("listing_interactions")
        .select("listing_id")
        .eq("user_id", user.id)
        .eq("action", "dislike");

      const dislikedIds = interactions?.map(i => i.listing_id) || [];

      if (dislikedIds.length === 0) {
        setListings([]);
        setLoading(false);
        setShowingDislikes(true);
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .in("id", dislikedIds)
        .limit(20);

      if (error) {
        console.error("Error fetching disliked listings:", error);
        toast.error("Could not load homes");
      } else {
        setListings(data || []);
        setShowingDislikes(true);
      }
    } else {
      const { data: interactions } = await supabase
        .from("listing_interactions")
        .select("listing_id")
        .eq("user_id", user.id);

      const seenIds = interactions?.map(i => i.listing_id) || [];

      let query = supabase.from("listings").select("*");

      if (seenIds.length > 0) {
        query = query.not("id", "in", `(${seenIds.join(',')})`);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        console.error("Error fetching new listings:", error);
        toast.error("Could not load homes");
      } else {
        setListings(data || []);
        setShowingDislikes(false);
      }
    }
    
    setLoading(false);
  };

  const handleAction = async (action: "like" | "dislike") => {
    setSwipeDirection(action === 'like' ? 'right' : 'left');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentListing = listings[currentIndex];
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
      return;
    }

    if (showingDislikes && action === "like") {
      await supabase
        .from("listing_interactions")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", currentListing.id);

      await supabase.from("listing_interactions").insert({
        user_id: user.id,
        listing_id: currentListing.id,
        action: "like",
      });

      const { error } = await supabase.from("likes").insert({
        user_id: user.id,
        listing_id: currentListing.id,
      });

      if (error && error.code !== "23505") {
        toast.error("Failed to save home");
      } else {
        toast.success("Saved to Listings!");
      }
    } else if (!showingDislikes) {
      await supabase.from("listing_interactions").insert({
        user_id: user.id,
        listing_id: currentListing.id,
        action: action,
      });

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
    }

    setCurrentIndex((prev) => prev + 1);
    setSwipeDirection(null);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold text-white text-xl">Finding homes...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= listings.length) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <RotateCcw className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {showingDislikes ? "You've reviewed all passed homes!" : "No more homes nearby!"}
          </h2>
          <p className="text-gray-500 mb-6">
            {showingDislikes 
              ? "You've seen all the homes you previously passed on." 
              : "You've seen everything new in your area for now."}
          </p>
          <button 
            onClick={() => {
              setCurrentIndex(0);
              fetchListings(!showingDislikes);
            }}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            {showingDislikes ? "Check for New Listings" : "Review Passed Homes"}
          </button>
        </div>
      </div>
    );
  }

  const currentHome = listings[currentIndex];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-500 overflow-hidden flex flex-col">
      {/* Fixed Header */}
      <div className="bg-white z-10 py-4 shadow-sm border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-500 rounded-full p-2">
            <Home className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Showing Dislikes Badge */}
      {showingDislikes && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
          Reviewing Passed Homes
        </div>
      )}

      {/* Main Content Area - Flexbox */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 overflow-hidden">
        {/* Property Card */}
        <div 
          className={`bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md transition-all duration-300 flex flex-col ${
            swipeDirection === 'left' 
              ? 'opacity-0 -translate-x-full' 
              : swipeDirection === 'right'
              ? 'opacity-0 translate-x-full'
              : 'opacity-100 translate-x-0'
          }`}
          style={{ maxHeight: '75vh' }}
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

          {/* Image - Takes up 60% of card */}
          <div className="relative flex-shrink-0" style={{ height: '45vh', maxHeight: '400px' }}>
            <img 
              src={currentHome.cover_photo_url || "https://images.unsplash.com/photo-1518780664697-55e3ad937233"} 
              alt={currentHome.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info Section - Takes remaining space */}
          <div className="p-5 flex-1 overflow-y-auto">
            {/* Price */}
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              ${currentHome.price_max.toLocaleString()}
            </h1>

            {/* Address */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-1">
              {currentHome.title}
            </p>

            {/* Bed/Bath/Sqft Stats */}
            <div className="flex items-center gap-5 text-base font-semibold text-gray-800 mb-3">
              <div className="flex items-center gap-1">
                <span>{currentHome.bedrooms || 0}</span>
                <span className="text-xs text-gray-500 font-normal">beds</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{currentHome.bathrooms || 0}</span>
                <span className="text-xs text-gray-500 font-normal">baths</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{currentHome.sqft?.toLocaleString() || '--'}</span>
                <span className="text-xs text-gray-500 font-normal">sqft</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {currentHome.description}
            </p>

            {/* Category Tag */}
            {currentHome.housing_category && (
              <div className="flex gap-2">
                <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100">
                  {currentHome.housing_category}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 mt-6 shrink-0">
          <button 
            onClick={() => handleAction("dislike")}
            disabled={swipeDirection !== null || showingDislikes}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <X className="w-8 h-8 text-red-500" strokeWidth={3} />
          </button>
          
          <button 
            onClick={() => navigate(`/listing/${currentHome.id}`)}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Info className="w-6 h-6 text-gray-400" />
          </button>

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
  );
};