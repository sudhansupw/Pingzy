import React, { useEffect, useRef } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../components/skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    activeChat,
    getMessages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useMessageStore();

  // console.log("ACTIVE CHAT:", activeChat);
  // console.log("MESSAGES:", messages);

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages + sockets
  useEffect(() => {
    if (!activeChat) return;

    getMessages();
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [activeChat]);

  // =========================
  // Empty state
  // =========================
  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        Select a chat to start messaging
      </div>
    );
  }

  // =========================
  // Loading
  // =========================
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId._id === authUser._id;

          return (
            <div
              key={message._id}
              ref={index === messages.length - 1 ? messageEndRef : null}
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
            >
              {/* Avatar */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId.profilePic ||
                      "https://t3.ftcdn.net/jpg/05/00/54/28/360_F_500542898_LpYSy4RGAi95aDim3TLtSgCNUxNlOlcM.jpg"
                    }
                    alt="profile"
                  />
                </div>
              </div>

              {/* Header (name + time) */}
              <div className="chat-header mb-1 flex items-center gap-2">
                {activeChat.type === "group" && !isOwnMessage && (
                  <span className="text-xs font-medium opacity-70">
                    {message.senderId.fullName}
                  </span>
                )}
                <time className="text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* Message bubble */}
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
