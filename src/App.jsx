import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from './redux/actions/authActions';
import socket from './utils/socket';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ChatLayout from './layouts/ChatLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Conversations from './pages/chat/Conversations';
import Messages from './pages/chat/Messages';
import Stories from './pages/stories/Stories';
import CreateStory from './pages/stories/CreateStory';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import Followers from './pages/profile/Followers';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      socket.auth = { userId: user._id };
      socket.connect();
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/followers/:id" element={<Followers />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/stories/create" element={<CreateStory />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route element={<ChatLayout />}>
                <Route path="/chat" element={<Conversations />} />
                <Route path="/chat/:conversationId" element={<Messages />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;