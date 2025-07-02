import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get conversations
const getConversations = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/api/chat/conversations`, config);
  return response.data;
};

// Get or create conversation
const getOrCreateConversation = async (recipientId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/api/chat/conversations`, { recipientId }, config);
  return response.data;
};

// Get messages
const getMessages = async (conversationId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/api/chat/messages/${conversationId}`, config);
  return response.data;
};

// Send message
const sendMessage = async (messageData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  };
  const response = await axios.post(`${API_URL}/api/chat/messages`, messageData, config);
  return response.data;
};

// Mark messages as read
const markAsRead = async (conversationId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.put(`${API_URL}/api/chat/messages/read/${conversationId}`, {}, config);
  return response.data;
};

// Start video call
const startVideoCall = async (callData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/api/chat/call/start`, callData, config);
  return response.data;
};

// Update call status
const updateCallStatus = async (messageId, status, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.put(`${API_URL}/api/chat/call/update/${messageId}`, { status }, config);
  return response.data;
};

const chatService = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  startVideoCall,
  updateCallStatus
};

export default chatService;