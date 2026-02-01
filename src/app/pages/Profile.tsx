import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import {
  User,
  Settings,
  ShieldCheck,
  HelpCircle,
  LogOut,
  CheckCircle2,
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else {
        setProfile(data);
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
    else window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold text-white text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userDisplay = profile || {
    full_name: "User",
    age: "--",
    university: "Not specified",
    bio: "No bio added yet.",
    interests: [],
    sleep_habit: "Not set",
    cleanliness_habit: "Not set",
    social_habit: "Not set",
    budget: "0",
    avatar_url: "",
    major: "",
    year: ""
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Gradient Header Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-500 pt-16 pb-20 px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-white">Profile</h1>
        </div>
      </div>

      {/* Content - overlapping the gradient */}
      <div className="max-w-md mx-auto px-6 -mt-12 relative z-10">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl mb-4">
          {/* Profile Header */}
          <div className="flex items-start gap-4 mb-4 pb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
              {userDisplay.avatar_url ? (
                <img src={userDisplay.avatar_url} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-14 h-14 text-gray-300" />
                </div>
              )}
            </div>
            
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{userDisplay.full_name}</h2>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Verified</span>
                </span>
              </div>
              <p className="text-gray-600 text-base mb-1">{userDisplay.age} years old</p>
              <p className="text-gray-900 text-base">{userDisplay.university || userDisplay.occupation}</p>
              {userDisplay.major && (
                <p className="text-gray-600 text-sm">
                  {userDisplay.major}{userDisplay.year && ` • ${userDisplay.year}`}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-700 text-sm leading-relaxed mb-6 break-words">
            {userDisplay.bio}
          </p>

          {/* Interests */}
          {userDisplay.interests && userDisplay.interests.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                INTERESTS
              </h4>
              <div className="flex flex-wrap gap-2">
                {userDisplay.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-900"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sleep</p>
              <p className="text-base font-bold text-gray-900">{userDisplay.sleep_habit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Cleanliness</p>
              <p className="text-base font-bold text-gray-900">{userDisplay.cleanliness_habit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Social</p>
              <p className="text-base font-bold text-gray-900">{userDisplay.social_habit}</p>
            </div>
          </div>

          {/* Budget */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Budget</p>
            <p className="text-2xl font-bold text-gray-900">
              ${userDisplay.budget}/month
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-white flex items-center gap-4 p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <Settings className="w-6 h-6 text-gray-700" />
            <span className="text-base font-medium text-gray-900">Settings</span>
          </button>

          <button className="w-full bg-white flex items-center gap-4 p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <ShieldCheck className="w-6 h-6 text-gray-700" />
            <span className="text-base font-medium text-gray-900">Safety & Privacy</span>
          </button>

          <button className="w-full bg-white flex items-center gap-4 p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <HelpCircle className="w-6 h-6 text-gray-700" />
            <span className="text-base font-medium text-gray-900">Help & Support</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full bg-white flex items-center gap-4 p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition"
          >
            <LogOut className="w-6 h-6 text-red-500" />
            <span className="text-base font-semibold text-red-500">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};