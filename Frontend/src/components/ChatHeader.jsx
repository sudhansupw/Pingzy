import { X, Clock, Link2, Trash2, TimerReset, Info } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import { useCountdown } from "../lib/useCountdown";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";

const ChatHeader = () => {
  const { activeChat, clearActiveChat, endGroup, extendGroup } =
    useMessageStore();
  const { authUser, onlineUsers } = useAuthStore();

  const navigate = useNavigate();

  // if (!activeChat) return null;

  const isGroup = activeChat.type === "group";
  const chat = activeChat.data;

  // Timer (group only)
  const expiresAt =
    activeChat?.type === "group" ? activeChat.data.expiresAt : null;
  const timeLeft = useCountdown(expiresAt);

  // Admin check
  const adminId = typeof chat.admin === "object" ? chat.admin._id : chat.admin;

  const isAdmin = isGroup && String(adminId) === String(authUser._id);

  // console.log("ADMIN CHECK", {
  //   chatAdmin: chat.admin,
  //   authUserId: authUser._id,
  //   isEqual: String(chat.admin) === String(authUser._id),
  // });

  const copyInviteLink = async () => {
    const res = await axiosInstance.post(`/groups/${chat._id}/invite`);
    navigator.clipboard.writeText(res.data.inviteLink);
    toast.success("Invite link copied");
  };

  const endChat = async () => {
    try {
      await endGroup(chat._id);
      toast.success("Chat ended");
    } catch (err) {
      toast.error("Group already expired");
    }
  };

  const extendChat = async () => {
    await extendGroup(chat._id);
    toast.success("Chat extended by 30 minutes");
  };

  const openInfo = () => {
    navigate(isGroup ? "/profile?mode=group" : "/profile");
  };

  return (
    <div className="p-3 border-b border-base-300 flex items-center justify-between">
      {/* LEFT: Info */}
      <div className="flex items-center gap-3">
        <img
          src={
            isGroup
              ? chat.groupPic ||
                "https://cdn-icons-png.flaticon.com/512/681/681494.png"
              : chat.profilePic ||
                "https://t3.ftcdn.net/jpg/05/00/54/28/360_F_500542898_LpYSy4RGAi95aDim3TLtSgCNUxNlOlcM.jpg"
          }
          className="size-10 rounded-full object-cover"
          alt="chat"
        />

        <div className="flex flex-col">
          <span className="font-medium">
            {isGroup ? chat.name : chat.fullName}
          </span>

          {isGroup ? (
            <span className="text-sm text-zinc-400">
              Admin: {activeChat.data.admin?.fullName || "Unknown"}
            </span>
          ) : (
            <span className="text-xs text-zinc-400">
              {onlineUsers.includes(chat._id) ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      {/* CENTER: Timer (group only) */}
      {isGroup && (
        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <Clock size={14} />
          <span>{timeLeft}</span>
        </div>
      )}

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2">
        {isGroup && (
          <div
            role="button"
            onClick={copyInviteLink}
            className="btn btn-sm btn-ghost"
            title="Invite"
          >
            <Link2 size={16} />
          </div>
        )}

        {isAdmin && (
          <>
            <div
              role="button"
              onClick={extendChat}
              className="btn btn-sm btn-ghost"
              title="Extend chat"
            >
              <TimerReset size={16} />
            </div>

            <div
              role="button"
              onClick={endChat}
              className="btn btn-sm btn-ghost text-error"
              title="End chat"
            >
              <Trash2 size={16} />
            </div>
          </>
        )}

        <button
          onClick={openInfo}
          className="btn btn-sm btn-ghost"
          title="Info"
        >
          <Info size={18} />
        </button>
        <button onClick={clearActiveChat} className="btn btn-sm btn-ghost">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
