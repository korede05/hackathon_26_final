import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { 
  User, 
  ChevronLeft, 
  Mail, 
  MapPin, 
  Briefcase, 
  Moon, 
  Sun, 
  Sparkles, 
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  age: number;
  university: string;
  occupation: string;
  avatar_url: string;
  interests: string[];
  sleep_habit: string;
  cleanliness_habit: string;
  social_level: string;
  budget: number;
  bio: string;
}

export const ViewProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Could not find this user");
        navigate("/matches");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id, navigate]);

  // if (loading) {
  //   return (
  //     <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
  //         <p className="font-bold text-white text-xl">Loading profile...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Fixed Header - matching other pages */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 py-4 shadow-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Profile Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-8">
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-500 rounded-3xl flex items-center justify-center overflow-hidden mb-4 shadow-md">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.full_name} />
              ) : (
                <User size={64} className="text-white" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {profile.full_name}, {profile.age || "--"}
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 text-gray-600 text-sm mb-4">
              {(profile.university || profile.occupation) && (
                <>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-gray-500" />
                    {profile.university || profile.occupation}
                  </span>
                  {profile.occupation && profile.university && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={16} className="text-gray-500" />
                      {profile.occupation}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
              <span className="text-2xl font-bold text-gray-900">${profile.budget?.toLocaleString() || 0}</span>
              <span className="text-sm text-gray-500 font-medium">/mo</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
          <p className="text-gray-700 leading-relaxed">{profile.bio || "No bio provided."}</p>
        </div>

        {/* Lifestyle & Interests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Habits */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Habits</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sleep</span>
                <span className="font-bold text-sm flex items-center gap-1.5 text-gray-900">
                  {profile.sleep_habit === "Early Bird" ? 
                    <Sun size={14} className="text-orange-500" /> : 
                    <Moon size={14} className="text-gray-600" />
                  }
                  {profile.sleep_habit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cleanliness</span>
                <span className="font-bold text-sm flex items-center gap-1.5 text-gray-900">
                  <Sparkles size={14} className="text-gray-600" />
                  {profile.cleanliness_habit}
                </span>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests && profile.interests.length > 0 ? (
                profile.interests.map((tag, i) => (
                  <span key={i} className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No interests listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Message Button */}
        <button 
          onClick={() => navigate(`/chat?dm=${profile.id}`)}
          className="w-full bg-black text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-md"
        >
          <Mail size={20} />
          Message {profile.full_name.split(' ')[0]}
        </button>
      </div>
    </div>
  );
};