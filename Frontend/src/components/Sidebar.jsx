import React, { useEffect, useState } from "react";
import { MessageCircle, Users2 } from "lucide-react";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Plus, LogIn } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";
import JoinGroupModal from "./JoinGroupModal";

const Sidebar = () => {
  const {
    users,
    groups,
    activeChat,
    getUsers,
    getGroups,
    setActiveChat,
    isUsersLoading,
  } = useMessageStore();

  const { onlineUsers } = useAuthStore();

  const [activeTab, setActiveTab] = useState("dm"); // "dm" | "group"
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [activeChat]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      className="
    h-full
    w-16 md:w-24 lg:w-72
    border-r border-base-300
    flex flex-col
    bg-base-100
  "
    >
      {/* ================= HEADER ================= */}

      <div className="border-b border-base-300 p-2">
        <div className="flex flex-col items-center gap-2">
          {/* DM BUTTON */}
          <button
            onClick={() => setActiveTab("dm")}
            className={`btn btn-sm w-full max-w-[48px] lg:max-w-none lg:w-full
        flex items-center justify-center gap-2
        ${activeTab === "dm" ? "btn-primary" : "btn-ghost"}`}
          >
            <MessageCircle size={16} />
            <span className="hidden lg:inline">DMs</span>
          </button>

          {/* GROUP BUTTON */}
          <button
            onClick={() => setActiveTab("group")}
            className={`btn btn-sm w-full max-w-[48px] lg:max-w-none lg:w-full
        flex items-center justify-center gap-2
        ${activeTab === "group" ? "btn-primary" : "btn-ghost"}`}
          >
            <Users2 size={16} />
            <span className="hidden lg:inline">Groups</span>
          </button>
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* ---------- DM TAB ---------- */}
        {activeTab === "dm" &&
          users.map((user) => {
            const isActive =
              activeChat?.type === "dm" && activeChat.data._id === user._id;

            return (
              <button
                key={user._id}
                onClick={() => setActiveChat({ type: "dm", data: user })}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300
                  ${isActive ? "bg-base-300 ring-1 ring-base-300" : ""}`}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={
                      user.profilePic ||
                      " https://t3.ftcdn.net/jpg/05/00/54/28/360_F_500542898_LpYSy4RGAi95aDim3TLtSgCNUxNlOlcM.jpg"
                    }
                    className="size-10 sm:size-12 rounded-full object-cover"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-2.5 sm:size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                  )}
                </div>

                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            );
          })}

        {/* ---------- GROUP TAB ---------- */}

        {activeTab === "group" && (
          <>
            {/* Create / Join Buttons */}

            <div className="flex flex-col items-center gap-2 p-2">
              <button
                onClick={() => setShowCreate(true)}
                className="btn btn-sm w-full max-w-[48px] lg:max-w-none lg:w-full flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span className="hidden lg:inline">Create</span>
              </button>

              <button
                onClick={() => setShowJoin(true)}
                className="btn btn-sm w-full max-w-[48px] lg:max-w-none lg:w-full flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span className="hidden lg:inline">Join</span>
              </button>
            </div>

            {/* Groups List */}
            <div className="flex flex-col">
              {groups.map((group) => {
                const isActive =
                  activeChat?.type === "group" &&
                  activeChat.data?._id === group._id;

                return (
                  <button
                    key={group._id}
                    onClick={() =>
                      setActiveChat({ type: "group", data: group })
                    }
                    className={`w-full p-3 flex items-center gap-3 hover:bg-base-300
              ${isActive ? "bg-base-300 ring-1 ring-base-300" : ""}`}
                  >
                    <img
                      src={
                        group.groupPic ||
                        "https://cdn-icons-png.flaticon.com/512/681/681494.png"
                      }
                      className="size-10 sm:size-12 rounded-full object-cover mx-auto lg:mx-0"
                    />

                    <div className="hidden lg:block text-left min-w-0">
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-sm text-zinc-400">
                        {group.members.length} members
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* EMPTY STATE */}
        {activeTab === "group" && groups.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No groups yet</div>
        )}
      </div>
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinGroupModal onClose={() => setShowJoin(false)} />}
    </aside>
  );
};

export default Sidebar;
