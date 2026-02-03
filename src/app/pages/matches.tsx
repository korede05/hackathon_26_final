import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { Users, MessageCircle, X } from "lucide-react";

export const MatchesPage = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data } = await supabase.from("profiles").select("*").limit(10);
      setProfiles(data || []);
    };
    fetchMatches();
  }, []);

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleStartGroup = () => {
    if (selectedUsers.length === 0) return;
    // Pass selection to ChatPage via navigation state
    navigate("/chat", { 
      state: { 
        isNewGroup: true, 
        memberIds: selectedUsers,
        groupName: "New Roommate Group"
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roommate Matches</h1>
            <p className="text-gray-500">Find people you'll vibe with</p>
          </div>
          <button 
            onClick={() => { setIsGroupMode(!isGroupMode); setSelectedUsers([]); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition ${
              isGroupMode ? "bg-red-50 text-red-600" : "bg-blue-600 text-white shadow-lg shadow-blue-200"
            }`}
          >
            {isGroupMode ? <X size={20}/> : <Users size={20}/>}
            {isGroupMode ? "Cancel" : "Create Group"}
          </button>
        </div>

        <div className="grid gap-4">
          {profiles.map((person) => (
            <div 
              key={person.id} 
              onClick={() => isGroupMode && toggleUser(person.id)}
              className={`p-4 rounded-2xl bg-white border-2 transition cursor-pointer flex items-center justify-between ${
                selectedUsers.includes(person.id) ? "border-blue-500 bg-blue-50" : "border-transparent"
              }`}
            >
              <div className="flex items-center gap-4">
                <img src={person.avatar_url || `https://ui-avatars.com/api/?name=${person.full_name}`} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-gray-900">{person.full_name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{person.bio || "No bio yet"}</p>
                </div>
              </div>
              
              {!isGroupMode ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/chat?dm=${person.id}`); }}
                  className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  <MessageCircle size={20} className="text-gray-600" />
                </button>
              ) : (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedUsers.includes(person.id) ? "bg-blue-600 border-blue-600" : "border-gray-300"
                }`}>
                  {selectedUsers.includes(person.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              )}
            </div>
          ))}
        </div>

        {isGroupMode && selectedUsers.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-6 animate-in slide-in-from-bottom-4">
            <span className="font-bold text-gray-700">{selectedUsers.length} selected</span>
            <button 
              onClick={handleStartGroup}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Start Group Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};