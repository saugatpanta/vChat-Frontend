import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get user profile
const getUser = async (userId) => {
  const response = await axios.get(`${API_URL}/api/users/${userId}`);
  return response.data;
};

// Update user profile
const updateUser = async (userId, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.put(`${API_URL}/api/users/${userId}`, userData, config);
  return response.data;
};

// Follow user
const followUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/api/users/${userId}/follow`, {}, config);
  return response.data;
};

// Unfollow user
const unfollowUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/api/users/${userId}/unfollow`, {}, config);
  return response.data;
};

// Search users
const searchUsers = async (query) => {
  const response = await axios.get(`${API_URL}/api/users/search/${query}`);
  return response.data;
};

// Get user suggestions
const getSuggestions = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/api/users/suggestions`, config);
  return response.data;
};

const userService = {
  getUser,
  updateUser,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestions
};

export default userService;