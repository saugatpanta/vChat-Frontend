import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from './components/common/Loader';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Conversations = lazy(() => import('./pages/chat/Conversations'));
const Messages = lazy(() => import('./pages/chat/Messages'));
const Stories = lazy(() => import('./pages/stories/Stories'));
const CreateStory = lazy(() => import('./pages/stories/CreateStory'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const EditProfile = lazy(() => import('./pages/profile/EditProfile'));
const Followers = lazy(() => import('./pages/profile/Followers'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/chat" element={<Conversations />} />
        <Route path="/chat/:conversationId" element={<Messages />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/create" element={<CreateStory />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/followers/:id" element={<Followers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;