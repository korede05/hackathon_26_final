import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../../styles/chat-overrides.css";
import {
  Chat, Channel, ChannelList, MessageInput, MessageList, Window,
  ChannelHeader, Thread, ChannelPreviewMessenger, ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";
import { supabase } from "../../../supabaseClient";
import { ChevronLeft } from "lucide-react";

const streamKey = import.meta.env.VITE_STREAM_API_KEY as string;
const chatClient = StreamChat.getInstance(streamKey);

export const ChatPage = () => {
  const [ready, setReady] = useState(false);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [showChannelList, setShowChannelList] = useState(true);
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
                <Window><ChannelHeader /><MessageList /><MessageInput /></Window>
              </Channel>
            ) : <div className="h-full flex items-center justify-center text-gray-400">Select a chat</div>}
          </div>
        </Chat>
      </div>
    </div>
  );
};