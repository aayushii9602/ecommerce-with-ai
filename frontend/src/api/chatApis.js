import axios from "axios";

const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT;
const HOST = import.meta.env.VITE_HOST;

// Start a new chat or send message to existing chat
export const sendChatMessage = async (message, chatId = null) => {
  try {
    const url = chatId 
      ? `http://${HOST}:${BACKEND_PORT}/api/v1/chat/${chatId}`
      : `http://${HOST}:${BACKEND_PORT}/api/v1/chat`;
    
    const response = await axios.post(url, {
      message: message,
      timestamp: new Date().toISOString()
    });
    
    return response.data;
  } catch (err) {
    console.error("Send message failed:", err);
    throw new Error(err.response?.data?.message || "Failed to send message");
  }
};

// Get chat history by chatId
export const getChatHistory = async (chatId) => {
  try {
    const response = await axios.get(`http://${HOST}:${BACKEND_PORT}/api/v1/chat/${chatId}`);
    return response.data;
  } catch (err) {
    console.error("Get chat history failed:", err);
    throw new Error(err.response?.data?.message || "Failed to load chat history");
  }
};

// Optional: Get all chats for a user (if you implement this later)
export const getAllChats = async () => {
  try {
    const response = await axios.get(`http://${HOST}:${BACKEND_PORT}/api/v1/chat`);
    return response.data;
  } catch (err) {
    console.error("Get all chats failed:", err);
    return [];
  }
};