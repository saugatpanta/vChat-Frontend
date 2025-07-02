import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import chatService from '../../api/chat';

const ConversationList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await chatService.getConversations(user.token);
        setConversations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    const socket = io(process.env.REACT_APP_API_URL, {
      auth: { token: user.token }
    });

    socket.on('receiveMessage', (message) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === message.conversation
            ? {
                ...conv,
                lastMessage: message,
                unreadCount: conv._id === message.conversation ? conv.unreadCount + 1 : 0
              }
            : conv
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user.token]);

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.participants.find((p) => p._id !== user._id);
    return otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = conversation.participants.find((p) => p._id !== user._id);
            const lastMessage = conversation.lastMessage;

            return (
              <Link
                key={conversation._id}
                to={`/chat/${conversation._id}`}
                className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  <Avatar
                    src={otherUser.avatar}
                    alt={otherUser.username}
                    size="lg"
                    status={otherUser.status}
                  />
                  {conversation.unreadCount > 0 && (
                    <Badge
                      count={conversation.unreadCount}
                      className="absolute -top-1 -right-1"
                    />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{otherUser.username}</h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500">
                        {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {lastMessage.sender._id === user._id && 'You: '}
                      {lastMessage.isMedia
                        ? 'Sent a media'
                        : lastMessage.text.substring(0, 30)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;