import { createSlice } from '@reduxjs/toolkit';
import authService from '../../api/auth';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    },
    loadUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadUserSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loadUserFailure: (state, action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  loadUserStart,
  loadUserSuccess,
  loadUserFailure,
  logout,
  clearError
} = authSlice.actions;

export default authSlice.reducer;

export const login = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const { token, user } = await authService.login(credentials);
    localStorage.setItem('token', token);
    dispatch(loginSuccess({ user }));
  } catch (error) {
    dispatch(loginFailure(error.message));
    throw error;
  }
};

export const register = (userData) => async (dispatch) => {
  dispatch(registerStart());
  try {
    const { token, user } = await authService.register(userData);
    localStorage.setItem('token', token);
    dispatch(registerSuccess({ user }));
  } catch (error) {
    dispatch(registerFailure(error.message));
    throw error;
  }
};

export const loadUser = () => async (dispatch) => {
  dispatch(loadUserStart());
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return dispatch(loadUserFailure('No token found'));
    }
    const { user } = await authService.getMe(token);
    dispatch(loadUserSuccess({ user }));
  } catch (error) {
    localStorage.removeItem('token');
    dispatch(loadUserFailure(error.message));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await authService.logout();
  } finally {
    localStorage.removeItem('token');
    dispatch(logout());
  }
};