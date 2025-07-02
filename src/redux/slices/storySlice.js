import { createSlice } from '@reduxjs/toolkit';
import storyService from '../../api/stories';

const initialState = {
  stories: [],
  loading: false,
  error: null
};

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    getStoriesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getStoriesSuccess: (state, action) => {
      state.stories = action.payload;
      state.loading = false;
      state.error = null;
    },
    getStoriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createStoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createStorySuccess: (state, action) => {
      state.stories.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    createStoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  getStoriesStart,
  getStoriesSuccess,
  getStoriesFailure,
  createStoryStart,
  createStorySuccess,
  createStoryFailure
} = storySlice.actions;

export default storySlice.reducer;

export const fetchStories = () => async (dispatch, getState) => {
  dispatch(getStoriesStart());
  try {
    const { token } = getState().auth.user;
    const { data } = await storyService.getStories(token);
    dispatch(getStoriesSuccess(data));
  } catch (error) {
    dispatch(getStoriesFailure(error.message));
  }
};

export const createNewStory = (storyData) => async (dispatch, getState) => {
  dispatch(createStoryStart());
  try {
    const { token } = getState().auth.user;
    const { data } = await storyService.createStory(storyData, token);
    dispatch(createStorySuccess(data));
  } catch (error) {
    dispatch(createStoryFailure(error.message));
  }
};