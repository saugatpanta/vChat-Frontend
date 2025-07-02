import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, userData);
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Get user
const getMe = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/api/auth/me`, config);
  return response.data;
};

// Forgot password
const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/api/auth/forgotpassword`, { email });
  return response.data;
};

// Reset password
const resetPassword = async (resetToken, password) => {
  const response = await axios.put(`${API_URL}/api/auth/resetpassword/${resetToken}`, { password });
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
};

const authService = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout
};

export default authService;