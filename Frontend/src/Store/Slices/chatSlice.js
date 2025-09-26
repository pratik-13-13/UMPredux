import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//const API_BASE = "https://api-umpredux.onrender.com/api/chat"
const API_BASE = 'http://192.168.1.154:5000/api/chat'; 

// Helper function to get token (DRY principle)
const getAuthToken = (state) => {
  return state.user?.token || 
         state.user?.userInfo?.token ||
         localStorage.getItem('authToken') ||
         localStorage.getItem('token');
};

// Get user chats
export const getUserChats = createAsyncThunk(
  'chat/getUserChats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = getAuthToken(state);
      
    
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
   
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', response.status, errorData);
        throw new Error(errorData.message || `Failed to fetch chats: ${response.status}`);
      }
      
      const data = await response.json();
     
      return data;
    } catch (error) {
      console.error('❌ getUserChats error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Create or get existing chat
export const createOrGetChat = createAsyncThunk(
  'chat/createOrGetChat',
  async (participantId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = getAuthToken(state);
      
    
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId }),
      });
      
    
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', response.status, errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
    
      return data;
    } catch (error) {
      console.error('❌ createOrGetChat error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Get chat messages
export const getChatMessages = createAsyncThunk(
  'chat/getChatMessages',
  async ({ chatId, page = 1 }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = getAuthToken(state);
      
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE}/${chatId}/messages?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch messages');
      }
      
      const messages = await response.json();
      return { chatId, messages, page };
    } catch (error) {
      console.error('❌ getChatMessages error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Send message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content, messageType = 'text' }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = getAuthToken(state);
      
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      if (!content || content.trim().length === 0) {
        throw new Error('Message content is required');
      }
      
      const response = await fetch(`${API_BASE}/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: content.trim(), messageType }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      const message = await response.json();
      return { chatId, message };
    } catch (error) {
      console.error('❌ sendMessage error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    currentChat: null,
    messages: {},
    typingUsers: {},
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      // ✅ FIXED: Check for duplicates before adding
      const isDuplicate = state.messages[chatId].some(m => m._id === message._id);
      if (!isDuplicate) {
        state.messages[chatId].push(message);
      }
    },
    setTyping: (state, action) => {
      const { chatId, user, isTyping } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }
      if (isTyping) {
        if (!state.typingUsers[chatId].some(u => u._id === user._id)) {
          state.typingUsers[chatId].push(user);
        }
      } else {
        state.typingUsers[chatId] = state.typingUsers[chatId].filter(
          u => u._id !== user._id
        );
      }
    },
    updateMessageStatus: (state, action) => {
      const { chatId, messageId, status } = action.payload;
      if (state.messages[chatId]) {
        const message = state.messages[chatId].find(m => m._id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user chats
      .addCase(getUserChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(getUserChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create or get chat
      .addCase(createOrGetChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrGetChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;
        // Add to chats if not already exists
        const existingChat = state.chats.find(chat => chat._id === action.payload._id);
        if (!existingChat) {
          state.chats.unshift(action.payload);
        }
      })
      .addCase(createOrGetChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get chat messages
      .addCase(getChatMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages;
      })
      .addCase(getChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        // Don't set loading true for sending messages (better UX)
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { chatId, message } = action.payload;
        if (!state.messages[chatId]) {
          state.messages[chatId] = [];
        }
        
        // ✅ FIXED: Add message to sender's view immediately (avoid duplicates)
        const isDuplicate = state.messages[chatId].some(m => m._id === message._id);
        if (!isDuplicate) {
          state.messages[chatId].push(message);
        }
        
        // Update last message in chat list
        const chat = state.chats.find(c => c._id === chatId);
        if (chat) {
          chat.lastMessage = message;
          chat.lastActivity = message.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { 
  setCurrentChat, 
  addMessage, 
  setTyping, 
  updateMessageStatus,
  clearError 
} = chatSlice.actions;

export default chatSlice.reducer;
