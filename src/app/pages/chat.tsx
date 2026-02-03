import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../../styles/chat-overrides.css";
import {
  Chat, Channel, ChannelList, MessageInput, MessageList, Window,
  ChannelPreviewMessenger, ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";
import { supabase } from "../../../supabaseClient";
import { ChevronLeft, Pencil, X, Check, UserPlus } from "lucide-react";

const streamKey = import.meta.env.VITE_STREAM_API_KEY as string;
const chatClient = StreamChat.getInstance(streamKey);

export const ChatPage = () => {
  const [ready, setReady] = useState(false);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [showChannelList, setShowChannelList] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedNewMembers, setSelectedNewMembers] = useState<string[]>([]);
  const [params] = useSearchParams();
  const location = useLocation();
  const dmUserId = params.get("dm");

  const CustomChannelPreview = (props: ChannelPreviewUIComponentProps) => (
    <ChannelPreviewMessenger {...props} onSelect={() => { setActiveChannel(props.channel); setShowChannelList(false); }} />
  );

  // --- GROUP CHAT LOGIC ---
  const createGroupChat = useCallback(async (memberIds: string[], groupName: string) => {
    try {
      // 1. Ensure all members exist in Stream via Netlify Functions
      await Promise.all(memberIds.map(id => 
        fetch("/.netlify/functions/ensure-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        })
      ));

      // 2. Create the channel with a unique ID
      const allMembers = [chatClient.userID!, ...memberIds].sort();
      const channelId = `group_${allMembers.join("_")}`.substring(0, 64);
      const channel = chatClient.channel("messaging", channelId, {
        name: groupName,
        members: allMembers,
      } as Record<string, unknown>);

      await channel.watch();
      setActiveChannel(channel);
      setShowChannelList(false);
    } catch (err) {
      console.error("Group creation failed:", err);
    }
  }, []);

  // --- RENAME GROUP CHAT ---
  const renameGroupChat = useCallback(async (newName: string) => {
    if (!activeChannel || !newName.trim()) return;
    try {
      await activeChannel.update({ name: newName.trim() });
      setIsEditingName(false);
      setNewGroupName("");
    } catch (err) {
      console.error("Failed to rename group:", err);
    }
  }, [activeChannel]);

  const startEditingName = () => {
    if (activeChannel) {
      setNewGroupName(activeChannel.data?.name || "");
      setIsEditingName(true);
    }
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setNewGroupName("");
  };

  // --- ADD MEMBERS TO GROUP ---
  const openAddMembers = async () => {
    if (!activeChannel) return;
    // Get current members
    const currentMemberIds = Object.keys(activeChannel.state.members || {});
    // Fetch all profiles except current members
    const { data } = await supabase
      .from("profiles")
      .select("*");
    const available = (data || []).filter(u => !currentMemberIds.includes(u.id));
    setAvailableUsers(available);
    setSelectedNewMembers([]);
    setShowAddMembers(true);
  };

  const toggleNewMember = (userId: string) => {
    setSelectedNewMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const addMembersToGroup = async () => {
    if (!activeChannel || selectedNewMembers.length === 0) return;
    try {
      // Ensure users exist in Stream
      await Promise.all(selectedNewMembers.map(async (id) => {
        const user = availableUsers.find(u => u.id === id);
        await fetch("/.netlify/functions/ensure-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, name: user?.full_name || "User", image: user?.avatar_url }),
        });
      }));
      // Add members to channel
      await activeChannel.addMembers(selectedNewMembers);
      setShowAddMembers(false);
      setSelectedNewMembers([]);
    } catch (err) {
      console.error("Failed to add members:", err);
    }
  };

  useEffect(() => {
    const connect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        const resp = await fetch("/.netlify/functions/stream-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, name: profile?.full_name || user.email }),
        });
        const { token } = await resp.json();
        await chatClient.connectUser({ id: user.id, name: profile?.full_name || user.email, image: profile?.avatar_url }, token);
        setReady(true);
      } catch (err) { console.error(err); }
    };
    connect();
    return () => { chatClient.disconnectUser(); };
  }, []);

  // Handle incoming group creation request from MatchesPage
  useEffect(() => {
    if (ready && location.state?.isNewGroup) {
      createGroupChat(location.state.memberIds, location.state.groupName);
      window.history.replaceState({}, document.title); // Clear state after run
    }
  }, [ready, location.state, createGroupChat]);

  useEffect(() => {
    const initDM = async () => {
      if (!ready || !dmUserId) return;
      const myId = chatClient.userID;
      if (!myId || myId === dmUserId) return;
      try {
        const channelId = `dm_${[myId, dmUserId].sort().join("_")}`.substring(0, 64);
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", dmUserId).single();
        await fetch("/.netlify/functions/ensure-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: dmUserId, name: profile?.full_name || "User", image: profile?.avatar_url }),
        });
        const channel = chatClient.channel("messaging", channelId, { members: [myId, dmUserId] });
        await channel.watch();
        setActiveChannel(channel);
        setShowChannelList(false);
      } catch (err) { console.error(err); }
    };
    initDM();
  }, [ready, dmUserId]);

  const filters = useMemo(() => ({ type: "messaging", members: { $in: [chatClient.userID || ""] } }), [ready]);
  const sort = useMemo(() => ({ last_message_at: -1 as const }), []);

  if (!ready) return <div className="h-screen flex items-center justify-center bg-blue-600 text-white font-bold">Connecting...</div>;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <div className="py-4 px-6 border-b flex items-center gap-4 shrink-0">
        {activeChannel && !showChannelList && <button onClick={() => setShowChannelList(true)} className="md:hidden"><ChevronLeft/></button>}
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      <div className="flex-1 overflow-hidden flex max-w-6xl w-full mx-auto pb-20">
        <Chat client={chatClient} theme="messaging light">
          <div className={`w-full md:w-80 border-r ${showChannelList ? 'block' : 'hidden md:block'}`}>
            <ChannelList filters={filters} sort={sort} Preview={CustomChannelPreview} />
          </div>
          <div className={`flex-1 ${!showChannelList ? 'block' : 'hidden md:block'}`}>
            {activeChannel ? (
              <Channel channel={activeChannel}>
                <Window>
                  {/* Custom Header with Rename for Groups */}
                  <div className="str-chat__header-livestream p-4 border-b flex items-center justify-between">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter group name"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameGroupChat(newGroupName);
                            if (e.key === "Escape") cancelEditingName();
                          }}
                        />
                        <button onClick={() => renameGroupChat(newGroupName)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                          <Check size={20} />
                        </button>
                        <button onClick={cancelEditingName} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-lg">
                          {activeChannel.data?.name || "Chat"}
                        </div>
                        {activeChannel.id?.startsWith("group_") && (
                          <div className="flex items-center gap-1">
                            <button onClick={openAddMembers} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Add members">
                              <UserPlus size={18} />
                            </button>
                            <button onClick={startEditingName} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Rename group">
                              <Pencil size={18} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            ) : <div className="h-full flex items-center justify-center text-gray-400">Select a chat</div>}
          </div>
        </Chat>
      </div>

      {/* Add Members Modal */}
      {showAddMembers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Members</h2>
              <button onClick={() => setShowAddMembers(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {availableUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users available to add</p>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleNewMember(user.id)}
                      className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 border-2 transition ${
                        selectedNewMembers.includes(user.id) ? "border-blue-500 bg-blue-50" : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{user.full_name}</span>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedNewMembers.includes(user.id) ? "bg-blue-600 border-blue-600" : "border-gray-300"
                      }`}>
                        {selectedNewMembers.includes(user.id) && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedNewMembers.length > 0 && (
              <div className="p-4 border-t">
                <button
                  onClick={addMembersToGroup}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Add {selectedNewMembers.length} Member{selectedNewMembers.length > 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};