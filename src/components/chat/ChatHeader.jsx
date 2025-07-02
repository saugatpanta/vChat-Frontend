import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { EllipsisHorizontalIcon, ArrowLeftIcon, VideoCameraIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Dropdown from '../ui/Dropdown';
import Avatar from '../ui/Avatar';
import userService from '../../api/users';

const ChatHeader = ({ conversation }) => {
  const { user } = useSelector((state) => state.auth);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { conversationId } = useParams();

  useEffect(() => {
    if (conversation) {
      const user = conversation.participants.find((p) => p._id !== user._id);
      setOtherUser(user);
      setLoading(false);
    } else {
      const fetchConversation = async () => {
        try {
          const { data } = await chatService.getOrCreateConversation(conversationId, user.token);
          const otherUser = data.participants.find((p) => p._id !== user._id);
          setOtherUser(otherUser);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchConversation();
    }
  }, [conversation, conversationId, user._id, user.token]);

  const handleVideoCall = async () => {
    try {
      const { data } = await chatService.startVideoCall(
        {
          recipientId: otherUser._id,
          isVideo: true
        },
        user.token
      );
      // Handle call initiation
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoiceCall = async () => {
    try {
      const { data } = await chatService.startVideoCall(
        {
          recipientId: otherUser._id,
          isVideo: false
        },
        user.token
      );
      // Handle call initiation
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="animate-pulse h-8 w-8 rounded-full bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="md:hidden text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-3">
          <Avatar src={otherUser.avatar} size="md" status={otherUser.status} />
          <div>
            <h3 className="font-medium text-gray-900">{otherUser.username}</h3>
            <p className="text-xs text-gray-500">
              {otherUser.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={handleVoiceCall}
          className="text-gray-500 hover:text-indigo-600"
        >
          <PhoneIcon className="h-5 w-5" />
        </button>
        <button
          onClick={handleVideoCall}
          className="text-gray-500 hover:text-indigo-600"
        >
          <VideoCameraIcon className="h-5 w-5" />
        </button>
        <Dropdown
          trigger={
            <button className="text-gray-500 hover:text-gray-700">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          }
          items={[
            {
              label: 'View profile',
              onClick: () => navigate(`/profile/${otherUser._id}`)
            },
            {
              label: 'Clear chat',
              onClick: () => console.log('Clear chat')
            },
            {
              label: 'Block user',
              onClick: () => console.log('Block user')
            }
          ]}
        />
      </div>
    </div>
  );
};

export default ChatHeader;