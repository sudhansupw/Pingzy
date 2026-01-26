import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set, get) => ({
  // STATE
  messages: [],
  users: [],
  groups: [],

  activeChat: null, // { type: "dm" | "group", data }
  isUsersLoading: false,
  isMessagesLoading: false,

  // USERS (DM SIDEBAR)

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/msg/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // GROUPS (GROUP SIDEBAR)

  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data.groups });
    } catch (error) {
      toast.error("Failed to fetch groups");
      console.log("get group error ", error.message);
    }
  },

  // SET ACTIVE CHAT

  setActiveChat: (chat) => {
    const socket = useAuthStore.getState().socket;
    const prevChat = get().activeChat;

    // leave old group
    if (prevChat?.type === "group") {
      socket?.emit("leaveGroup", prevChat.data._id);
    }

    set({ activeChat: chat, messages: [] });

    // 🔥 JOIN GROUP ROOM
    if (chat?.type === "group") {
      socket?.emit("joinGroup", chat.data._id);
    }
  },

  clearActiveChat: () => {
    const socket = useAuthStore.getState().socket;
    const { activeChat } = get();

    if (activeChat?.type === "group") {
      socket?.emit("leaveGroup", activeChat.data._id);
    }

    set({ activeChat: null, messages: [] });
  },

  // GET MESSAGES (REST)

  getMessages: async () => {
    const { activeChat } = get();
    if (!activeChat) return;

    set({ isMessagesLoading: true });

    try {
      const res = await axiosInstance.get(
        `/msg/${activeChat.type}/${activeChat.data._id}`,
      );
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // SEND MESSAGE (SOCKET)

  sendMessage: ({ text, image }) => {
    const { activeChat } = get();
    const socket = useAuthStore.getState().socket;

    if (!activeChat || !socket) return;

    if (activeChat.type === "dm") {
      socket.emit("sendMessage", {
        receiverId: activeChat.data._id,
        text,
        image,
      });
    }

    if (activeChat.type === "group") {
      socket.emit("sendGroupMessage", {
        groupId: activeChat.data._id,
        text,
        image,
      });
    }
  },

  // SOCKET LISTENERS
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("newGroupMessage");

    // DM listener
    socket.on("newMessage", (message) => {
      const { activeChat } = get();
      if (activeChat?.type !== "dm") return;

      const senderId =
        typeof message.senderId === "object"
          ? message.senderId._id
          : message.senderId;

      const receiverId =
        typeof message.receiverId === "object"
          ? message.receiverId._id
          : message.receiverId;

      if (
        senderId === activeChat.data._id ||
        receiverId === activeChat.data._id
      ) {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      }
    });

    // 🔥 GROUP listener
    socket.on("newGroupMessage", (message) => {
      const { activeChat } = get();
      if (
        activeChat?.type === "group" &&
        String(message.groupId) === String(activeChat.data._id)
      ) {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("newGroupMessage");
  },

  // group create and join

  // CREATE GROUP

  createGroup: async ({ name, password }) => {
    try {
      const res = await axiosInstance.post("/groups/create", {
        name,
        password,
      });

      set((state) => ({
        groups: [res.data, ...state.groups],
      }));

      toast.success("Group created");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  },

  // JOIN GROUP

  joinGroup: async ({ groupId, password }) => {
    try {
      const res = await axiosInstance.post("/groups/join", {
        groupId,
        password,
      });

      set((state) => ({
        groups: [res.data, ...state.groups],
      }));

      toast.success("Joined group");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join group");
    }
  },

  endGroup: async (groupId) => {
    await axiosInstance.delete(`/groups/${groupId}`);
    set((state) => ({
      groups: state.groups.filter((g) => g._id !== groupId),
      activeChat: null,
    }));
  },

  extendGroup: async (groupId) => {
    const res = await axiosInstance.patch(`/groups/${groupId}/extend`);
    set((state) => ({
      groups: state.groups.map((g) =>
        g._id === groupId ? { ...g, expiresAt: res.data.expiresAt } : g,
      ),
      activeChat:
        state.activeChat?.data._id === groupId
          ? {
              ...state.activeChat,
              data: { ...state.activeChat.data, expiresAt: res.data.expiresAt },
            }
          : state.activeChat,
    }));
  },
}));
