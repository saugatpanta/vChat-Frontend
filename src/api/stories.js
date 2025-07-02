import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create story
const createStory = async (storyData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  };
  const response = await axios.post(`${API_URL}/api/stories`, storyData, config);
  return response.data;
};

// Get stories
const getStories = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/api/stories`, config);
  return response.data;
};

// Get story
const getStory = async (storyId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/api/stories/${storyId}`, config);
  return response.data;
};

// Delete story
const deleteStory = async (storyId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.delete(`${API_URL}/api/stories/${storyId}`, config);
  return response.data;
};

// View story
const viewStory = async (storyId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/api/stories/${storyId}/view`, {}, config);
  return response.data;
};

const storyService = {
  createStory,
  getStories,
  getStory,
  deleteStory,
  viewStory
};

export default storyService;