import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { 
  MapPin, 
  ChevronLeft, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Share2
} from "lucide-react";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  price_max: number;
  address: string;
  image_url: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  housing_category?: string;
  description?: string;
  cover_photo_url: string;
}

export const ViewListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchListingDetails();
    checkIfSaved();
  }, [id]);

  const fetchListingDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching listing:", error);
      toast.error("Could not find listing details");
      navigate("/browse");
    } else {
      setListing(data);
    }
    setLoading(false);
  };

  const checkIfSaved = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .single();

    setIsSaved(!!data);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save listings");
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", id);

      if (!error) {
        setIsSaved(false);
        toast.success("Removed from saved homes");
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: user.id, listing_id: id });

      if (error) {
        if (error.code === "23505") {
          toast.info("Already saved!");
        } else {
          toast.error("Failed to save");
        }
      } else {
        setIsSaved(true);
        toast.success("Saved to your list!");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold text-white text-xl">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 py-4 shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 truncate flex-1">{listing.title}</h1>
          <button 
            onClick={handleSave}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Heart 
              size={24} 
              className={isSaved ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-24">
        <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100">
          {/* Main Image */}
          <div className="w-full h-96 relative">
            <img 
              src={listing.cover_photo_url|| "https://images.unsplash.com/photo-1518780664697-55e3ad937233"} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {listing.housing_category && (
              <span className="absolute top-4 left-4 bg-gradient-to-br from-blue-600 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {listing.housing_category}
              </span>
            )}
          </div>

          <div className="p-8">
            {/* Title and Price */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{listing.title}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} />
                  <p className="text-base">{listing.title || "Location not specified"}</p>
                </div>
              </div>
              <div className="bg-white border-2 border-gray-200 px-6 py-3 rounded-2xl">
                <p className="text-gray-900 font-bold text-3xl">
                  ${listing.price_max.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500"> /mo</span>
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-gray-100">
              <div className="text-center">
                <Bed className="mx-auto mb-2 text-gray-600" size={24} />
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Bedrooms</p>
                <p className="font-bold text-xl text-gray-900">{listing.bedrooms || 0}</p>
              </div>
              <div className="text-center">
                <Bath className="mx-auto mb-2 text-gray-600" size={24} />
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Bathrooms</p>
                <p className="font-bold text-xl text-gray-900">{listing.bathrooms || 0}</p>
              </div>
              <div className="text-center">
                <Square className="mx-auto mb-2 text-gray-600" size={24} />
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Square Feet</p>
                <p className="font-bold text-xl text-gray-900">{listing.sqft?.toLocaleString() || '--'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {listing.description || "No description provided for this listing."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition">
                Contact Landlord
              </button>
              <button className="px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                <Share2 className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};