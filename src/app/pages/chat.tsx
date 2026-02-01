import { useSearchParams, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import "../../styles/chat-overrides.css";
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
import { ChevronLeft } from "lucide-react";

const streamKey = import.meta.env.VITE_STREAM_API_KEY as string;
const chatClient = StreamChat.getInstance(streamKey);

export const ChatPage = () => {
  const [ready, setReady] = useState(false);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [showChannelList, setShowChannelList] = useState(true);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dmUserId = params.get("dm");

  const CustomChannelPreview = (props: ChannelPreviewUIComponentProps) => {
    return (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          setActiveChannel(props.channel);
          setShowChannelList(false);
        }}
      />
    );
  };

  useEffect(() => {
    const connect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
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
        const channelId = `dm_${[myId, dmUserId].sort().join("_")}`.substring(0, 64);

        const existingChannels = await chatClient.queryChannels({
          type: "messaging",
          id: channelId,
        });

        if (existingChannels.length > 0) {
          setActiveChannel(existingChannels[0]);
          setShowChannelList(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", dmUserId)
          .single();

        await fetch("/.netlify/functions/ensure-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: dmUserId,
            name: profile?.full_name || "User",
            image: profile?.avatar_url || undefined,
          }),
        });

        const channel = chatClient.channel("messaging", channelId, {
          members: [myId, dmUserId],
        } as any);

        await channel.watch();
        setActiveChannel(channel);
        setShowChannelList(false);
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
  <div className="h-screen bg-white overflow-hidden flex flex-col">
    {/* Fixed Header */}
    <div className="bg-white z-10 py-4 shadow-sm border-b border-gray-100 shrink-0">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-4">
        {activeChannel && !showChannelList && (
          <button
            onClick={() => setShowChannelList(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 hidden md:block">Chat with potential roommates</p>
        </div>
      </div>
    </div>

    {/* Chat Container */}
    <div className="flex-1 max-w-6xl w-full mx-auto overflow-hidden pb-20">
      <Chat client={chatClient} theme="messaging light">
        <div className="flex h-full">
          {/* Sidebar */}
          <div
            className={`${
              showChannelList ? 'block' : 'hidden'
            } md:block w-full md:w-80 border-r border-gray-100 h-full overflow-y-auto bg-white`}
          >
            <ChannelList
              filters={filters}
              sort={sort}
              customActiveChannel={activeChannel?.id}
              Preview={CustomChannelPreview}
            />
          </div>

          {/* Main Chat Area */}
          <div
            className={`${
              !showChannelList ? 'block' : 'hidden'
            } md:block flex-1 bg-white h-full flex flex-col`}
          >
            {activeChannel ? (
              <Channel channel={activeChannel}>
                <Window>
                  <ChannelHeader />
                  <div className="flex-1 overflow-y-auto pb-2">
                    <MessageList />
                  </div>
                  <div className="shrink-0 pb-2">
                    <MessageInput />
                  </div>
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