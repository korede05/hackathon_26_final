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

// 1. Initialize Client outside to prevent re-renders
const streamKey = import.meta.env.VITE_STREAM_API_KEY as string;
const chatClient = StreamChat.getInstance(streamKey);

export const ChatPage = () => {
  const [ready, setReady] = useState(false);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [params] = useSearchParams();
  const dmUserId = params.get("dm");

  // Custom channel preview that handles selection
  const CustomChannelPreview = (props: ChannelPreviewUIComponentProps) => {
    return (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => setActiveChannel(props.channel)}
      />
    );
  };

  // 2. Main Connection Hook
  useEffect(() => {
    const connect = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // Fetch token from your server on port 3001
        const resp = await fetch("http://localhost:3001/stream-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: user.user_metadata?.full_name || user.email || "User",
          }),
        });

        const { token } = await resp.json();

        // Connect user to Stream using full UUID
        await chatClient.connectUser(
          {
            id: user.id,
            name: user.user_metadata?.full_name || user.email || "User",
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

  // 3. Hook for Opening a Direct Message (Consolidated and Shortened)
  useEffect(() => {
    const initDM = async () => {
      if (!ready || !dmUserId) return;

      const myId = chatClient.userID;
      if (!myId || myId === dmUserId) return;

      try {
        // Fetch the DM target's profile from Supabase
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", dmUserId)
          .single();

        // Ensure the DM target user exists in Stream Chat before creating channel
        await fetch("http://localhost:3001/ensure-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: dmUserId,
            name: profile?.full_name || "User",
            image: profile?.avatar_url || undefined,
          }),
        });

        // FIX: Truncate IDs to stay under Stream's 64-character limit
        const myShortId = myId.substring(0, 20);
        const dmShortId = dmUserId.substring(0, 20);

        // Use shortened IDs for the channel name to stay under 64 chars
        const channelId = `dm_${[myShortId, dmShortId].sort().join("_")}`;

        const channel = chatClient.channel("messaging", channelId, {
          members: [myId, dmUserId], // Use FULL IDs here so permissions work
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

  if (!ready)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold">Initializing Chat...</p>
          <p className="text-xs mt-2 text-gray-400">
            Ensure port 3001 is running
          </p>
        </div>
      </div>
    );

  return (
    <div className="h-[calc(100vh-80px)] bg-white">
      <Chat client={chatClient} theme="messaging light">
        <div className="flex h-full max-w-6xl mx-auto shadow-xl overflow-hidden">
          <div className="w-80 border-r border-gray-100 h-full overflow-y-auto bg-white">
            <div className="p-6 border-b border-gray-50">
              <h1 className="text-2xl font-black text-gray-900">Messages</h1>
            </div>
            <ChannelList
              filters={filters}
              sort={sort}
              customActiveChannel={activeChannel?.id}
              Preview={CustomChannelPreview}
            />
          </div>

          <div className="flex-1 bg-gray-50 h-full">
            {activeChannel ? (
              <Channel channel={activeChannel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput focus />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Select a roommate to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </Chat>
    </div>
  );
};
