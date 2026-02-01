
import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import {
  User,
  Moon,
  Sun,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { calculateDeepMatch } from "../components/getAIscore";

interface MatchProfile {
  id: string;
  full_name: string;
  age: number;
  university: string;
  major: string;
  occupation: string;
  avatar_url: string;
  interests: string[];
  sleep_habit: string;
  cleanliness_habit: string;
  budget: number;
  bio: string;
}

export const MatchesPage: React.FC = () => {
  const [matchData, setMatchData] = useState<
    Record<string, { score: number; label: string; color: string }>
  >({});
  const [potentialMatches, setPotentialMatches] = useState<MatchProfile[]>([]);
  const [myProfile, setMyProfile] = useState<MatchProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculatingId, setCalculatingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in to see matches");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("onboarded", true);

    if (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load potential roommates");
    } else {
      const current = data.find((p) => p.id === user.id);
      const others = data.filter((p) => p.id !== user.id);

      setMyProfile(current || null);
      setPotentialMatches(others || []);
    }
    setLoading(false);
  };

  const getAiMatch = async (person: MatchProfile) => {
    if (!myProfile) {
      toast.error("Complete your profile first!");
      return;
    }

    setCalculatingId(person.id);

    const score = calculateDeepMatch(myProfile, person);

    const getCategory = (s: number) => {
      if (s >= 80)
        return {
          label: "Excellent Match",
          color: "text-green-600 bg-green-50 border-green-200",
        };
      if (s >= 60)
        return {
          label: "Good Match",
          color: "text-blue-600 bg-blue-50 border-blue-200",
        };
      if (s >= 40)
        return {
          label: "Moderate Match",
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        };
      if (s >= 20)
        return {
          label: "Ok Match",
          color: "text-orange-600 bg-orange-50 border-orange-200",
        };
      return {
        label: "Low Similarity",
        color: "text-red-600 bg-red-50 border-red-200",
      };
    };

    const category = getCategory(score);

    try {
      // UPDATED: Use Netlify Function endpoint instead of Railway
      await fetch("/.netlify/functions/stream-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: myProfile.id,
          name: myProfile.full_name,
        }),
      });

      setMatchData((prev) => ({
        ...prev,
        [person.id]: { score, label: category.label, color: category.color },
      }));
    } catch (err) {
      console.error("AI Match Error:", err);
      setMatchData((prev) => ({
        ...prev,
        [person.id]: { score, label: category.label, color: category.color },
      }));
    } finally {
      setCalculatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Fixed Header - matching other pages */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 py-4 shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Discover Roommates
          </h1>
          <p className="text-sm text-gray-500">
            {potentialMatches.length}{" "}
            {potentialMatches.length === 1
              ? "potential match"
              : "potential matches"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {potentialMatches.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-purple-500 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {person.avatar_url ? (
                    <img
                      src={person.avatar_url}
                      className="w-full h-full object-cover"
                      alt={person.full_name}
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                      {person.full_name}, {person.age || "--"}
                    </h2>

                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0 transition-all ${
                        matchData[person.id]
                          ? matchData[person.id].color
                          : "bg-gray-50 text-gray-400 border-gray-100"
                      }`}
                    >
                      <TrendingUp size={12} />
                      <span>
                        {matchData[person.id]
                          ? `${matchData[person.id].score}%`
                          : "TBD"}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm truncate">
                    {person.university || person.occupation}
                  </p>
                  <p className="text-gray-900 font-bold text-sm mt-1">
                    ${person.budget}/mo
                  </p>
                </div>
              </div>

              {/* Match Label Strip or Calculate Button */}
              {matchData[person.id] ? (
                <div
                  className={`mb-4 py-2 px-3 rounded-xl border text-[11px] font-bold text-center uppercase tracking-wider ${matchData[person.id].color}`}
                >
                  {matchData[person.id].label}
                </div>
              ) : (
                <button
                  onClick={() => getAiMatch(person)}
                  disabled={calculatingId === person.id}
                  className="mb-4 w-full py-2.5 bg-gray-50 border border-dashed border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  {calculatingId === person.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <TrendingUp size={12} />
                  )}
                  {calculatingId === person.id
                    ? "Analyzing..."
                    : "Calculate AI Compatibility"}
                </button>
              )}

              <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10 leading-relaxed">
                {person.bio || "No bio provided."}
              </p>

              <div className="flex gap-2 mb-6">
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 border border-gray-100">
                  {person.sleep_habit === "Early Bird" ? (
                    <Sun size={12} className="text-orange-500" />
                  ) : (
                    <Moon size={12} className="text-gray-600" />
                  )}
                  {person.sleep_habit}
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 border border-gray-100">
                  <Sparkles size={12} className="text-gray-600" />
                  {person.cleanliness_habit}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/viewprofile/${person.id}`)}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => navigate(`/chat?dm=${person.id}`)}
                  className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition border border-gray-200"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};