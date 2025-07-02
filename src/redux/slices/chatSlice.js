import { createSlice } from '@reduxjs/toolkit';
import chatService from '../../api/chat';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    getConversationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getConversationsSuccess: (state, action) => {
      state.conversations = action.payload;
      state.loading = false;
      state.error = null;
    },
    getConversationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    getMessagesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getMessagesSuccess: (state, action) => {
      state.messages = action.payload;
      state.loading = false;
      state.error = null;
    },
    getMessagesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    sendMessageStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    sendMessageSuccess: (state, action) => {
      state.messages.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    sendMessageFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    markAsReadSuccess: (state, action) => {
      const conversation = state.conversations.find(
        (c) => c._id === action.payload
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    }
  }
});

export const {
  getConversationsStart,
  getConversationsSuccess,
  getConversationsFailure,
  setActiveConversation,
  getMessagesStart,
  getMessagesSuccess,
  getMessagesFailure,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  markAsReadSuccess
} = chatSlice.actions;

export default chatSlice.reducer;

export const fetchConversations = () => async (dispatch, getState) => {
  dispatch(getConversationsStart());
  try {
    const { token } = getState().auth.user;
    const { data } = await chatService.getConversations(token);
    dispatch(getConversationsSuccess(data));
  } catch (error) {
    dispatch(getConversationsFailure(error.message));
  }
};

export const fetchMessages = (conversationId) => async (dispatch, getState) => {
  dispatch(getMessagesStart());
  try {
    const { token } = getState().auth.user;
    const { data } = await chatService.getMessages(conversationId, token);
    dispatch(getMessagesSuccess(data));
  } catch (error) {
    dispatch(getMessagesFailure(error.message));
  }
};

export const sendNewMessage = (messageData) => async (dispatch, getState) => {
  dispatch(sendMessageStart());
  try {
    const { token } = getState().auth.user;
    const { data } = await chatService.sendMessage(messageData, token);
    dispatch(sendMessageSuccess(data));
  } catch (error) {
    dispatch(sendMessageFailure(error.message));
  }
};

export const markMessagesAsRead = (conversationId) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth.user;
    await chatService.markAsRead(conversationId, token);
    dispatch(markAsReadSuccess(conversationId));
  } catch (error) {
    console.error(error);
  }
};