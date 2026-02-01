import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { Home, MapPin, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Listing {
  id: string;
  title: string;
  price_max: number;
  address: string;
  cover_photo_url: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  description?: string;
  housing_category?: "student" | "affordable" | "accessible" | "shelter";
}

export const ListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("likes")
      .select(
        `
        listing_id,
        listings (
          id,
          title,
          price_max,
          address,
          cover_photo_url,
          bedrooms,
          bathrooms,
          sqft,
          housing_category
        )
      `,
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load your listings");
    } else if (data) {
      const cleanData = data
        .map((item: any) => item.listings as Listing)
        .filter((listing) => listing !== null);

      setSavedListings(cleanData);
    }
    setLoading(false);
  };

  const handleRemoveLike = async (listingId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);

    if (error) {
      toast.error("Could not remove listing");
    } else {
      setSavedListings((prev) => prev.filter((item) => item.id !== listingId));
      toast.success("Removed from your list");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-linear-to-br from-blue-600 to-purple-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold text-white text-xl">
            Loading your saved homes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 py-4 shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-900">Saved Homes</h1>
          <p className="text-sm text-gray-500">
            {savedListings.length}{" "}
            {savedListings.length === 1 ? "home" : "homes"} saved
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-24">
        {savedListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-50 rounded-full p-6 mb-6">
              <Heart className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No saved homes yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start browsing to find your perfect home!
            </p>
            <button
              onClick={() => (window.location.href = "/browse")}
              className="bg-linear-to-br from-blue-600 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Start Browsing
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {savedListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="w-full sm:w-48 h-53 shrink-0 relative">
                    <img
                      src={
                        listing.cover_photo_url ||
                        "https://images.unsplash.com/photo-1518780664697-55e3ad937233"
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    {/* Top section */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Title */}
                          <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {listing.title}
                          </h2>

                          {/* Category badge - below title */}
                          {listing.housing_category && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-3">
                              {listing.housing_category === "student" ? "Student " :
                               listing.housing_category === "affordable" ? "Affordable " :
                               listing.housing_category === "accessible" ? "Accessible " :
                               listing.housing_category === "shelter" ? "Shelter" :
                               "Housing"}
                              {/* {resource.category === "volunteering" ? "Volunteering" */}

                            </span>
                          )}
                        </div>

                        {/* Trash button - top right */}
                        <button
                          onClick={() => handleRemoveLike(listing.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin size={14} />
                        <span className="text-sm">
                          {listing.title || "Location not specified"}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
                        <span>{listing.bedrooms || 0} beds</span>
                        <span>•</span>
                        <span>{listing.bathrooms || 0} baths</span>
                        <span>•</span>
                        <span>
                          {listing.sqft?.toLocaleString() || "--"} sqft
                        </span>
                      </div>
                    </div>

                    {/* Bottom section */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gray-900">
                        ${listing.price_max.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500">
                          /mo
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/listing/${listing.id}`)} // <-- Change this
                        className="bg-linear-to-br from-black to-black text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
