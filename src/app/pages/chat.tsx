import { useSearchParams } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import {
  Chat,
  Channel,
  ChannelList,
  MessageInput,
  MessageList,
  Window,
  ChannelHeader,
  Thread,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";
import { supabase } from "../../../supabaseClient";

const streamKey = import.meta.env.VITE_STREAM_API_KEY as string;
const chatClient = StreamChat.getInstance(streamKey);

export const ChatPage = () => {
  const [ready, setReady] = useState(false);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [params] = useSearchParams();
  const dmUserId = params.get("dm");

  const CustomChannelPreview = (props: ChannelPreviewUIComponentProps) => {
    return (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => setActiveChannel(props.channel)}
      />
    );
  };

  useEffect(() => {
    const connect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // Fetch current user's profile
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();

        const resp = await fetch("/.netlify/functions/stream-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: myProfile?.full_name || user.email || "User",
          }),
        });

        const { token } = await resp.json();

        await chatClient.connectUser(
          {
            id: user.id,
            name: myProfile?.full_name || user.email || "User",
            image: myProfile?.avatar_url || undefined,
          },
          token,
        );

        setReady(true);
      } catch (err) {
        console.error("Chat connection failed:", err);
      }
    };

    connect();

    return () => {
      chatClient.disconnectUser();
    };
  }, []);

  useEffect(() => {
    const initDM = async () => {
      if (!ready || !dmUserId) return;

      const myId = chatClient.userID;
      if (!myId || myId === dmUserId) return;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", dmUserId)
          .single();

        // Ensure the other user exists in Stream
        await fetch("/.netlify/functions/ensure-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: dmUserId,
            name: profile?.full_name || "User",
            image: profile?.avatar_url || undefined,
          }),
        });

        // Create deterministic channel ID
        const channelId = `dm_${[myId, dmUserId].sort().join("_")}`.substring(0, 64);

        const channel = chatClient.channel("messaging", channelId, {
          members: [myId, dmUserId],
          //name: profile?.full_name || "Direct Message",
        });

        await channel.watch();
        setActiveChannel(channel);
      } catch (err) {
        console.error("Failed to initialize DM:", err);
      }
    };

    initDM();
  }, [ready, dmUserId]);

  const filters = useMemo(
    () => ({
      type: "messaging",
      members: { $in: [chatClient.userID || ""] },
    }),
    [ready],
  );

  const sort = useMemo(() => ({ last_message_at: -1 as const }), []);

  if (!ready) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold text-white text-xl">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Fixed Header - matching other pages */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 py-4 shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">Chat with potential roommates</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-6xl mx-auto pt-24 h-screen">
        <Chat client={chatClient} theme="messaging light">
          <div className="flex h-[calc(100vh-96px-96px)] shadow-md border border-gray-100 rounded-2xl overflow-hidden bg-white">
            {/* Sidebar - Responsive */}
            <div className="w-full md:w-80 border-r border-gray-100 h-full overflow-y-auto bg-white">
              <div className="p-4 border-b border-gray-100 md:hidden">
                <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
              </div>
              <ChannelList
                filters={filters}
                sort={sort}
                customActiveChannel={activeChannel?.id}
                Preview={CustomChannelPreview}
              />
            </div>

            {/* Main Chat Area - Hidden on mobile when no channel selected */}
            <div className={`flex-1 bg-white h-full flex-col ${activeChannel ? 'flex' : 'hidden md:flex'}`}>
              {activeChannel ? (
                <Channel channel={activeChannel}>
                  <Window>
                    <ChannelHeader />
                    <div className="flex-1 overflow-y-auto">
                      <MessageList />
                    </div>
                    <MessageInput focus />
                  </Window>
                  <Thread />
                </Channel>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">No conversation selected</p>
                    <p className="text-sm">Choose a roommate to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Chat>
      </div>
    </div>
  );
};