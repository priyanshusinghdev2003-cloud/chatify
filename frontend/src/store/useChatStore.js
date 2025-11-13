import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";



export const useChatStore = create((set,get)=>({
    allContacts: null,
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  isTyping: false,

  setIsTyping: (value) => set({ isTyping: value }),


  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

   getAllContacts: async (data) => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.post("/message/contacts", data);
      set({ allContacts: res?.data?.user });
    } catch (error) {
   
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/chats");
      set({ chats: res.data?.chatPartners });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data?.messages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: String(new Date().toISOString()),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });
    console.log(messages)

    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data?.newMessage) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessage: ()=>{
    const {selectedUser, isSoundEnabled}= get()
    if(!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage)=>{
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id
      if(!isMessageSentFromSelectedUser) return;
      const currentMessages = get().messages;
      set({messages: [...currentMessages,newMessage]})

      if(isSoundEnabled){
        const notificationSound = new Audio("/sounds/notification.mp3")
        notificationSound.currentTime =0;
        notificationSound.play().catch((s)=> console.log("Audio play Failed:", e))
      }
    })
  },

  unSubscribeFromMessage: ()=>{
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
  startTyping : ({senderId, receiverId})=>{
     const socket = useAuthStore.getState().socket;
    socket.emit("typing", { senderId, receiverId });
  },
  stopTyping: ({senderId, receiverId})=>{
    const socket = useAuthStore.getState().socket;
    socket.emit("stopTyping", { senderId, receiverId });
  },
 senderTyping: () => {
  const socket = useAuthStore.getState().socket;
  const selectedUser = useChatStore.getState().selectedUser;
  if (!socket || !selectedUser) return;

  socket.off("userTyping"); // prevent duplicate listeners

  socket.on("userTyping", ({ senderId }) => {
    
    if (senderId === selectedUser._id) {
      useChatStore.setState({ isTyping: true });
    }
  });
},

senderStopTyping: () => {
  const socket = useAuthStore.getState().socket;
  const selectedUser = useChatStore.getState().selectedUser;

  if (!socket || !selectedUser) return;

  socket.off("userStopTyping");

  socket.on("userStopTyping", ({ senderId }) => {
    if (senderId === selectedUser._id) {
      useChatStore.setState({ isTyping: false });
    }
  });
},

}))