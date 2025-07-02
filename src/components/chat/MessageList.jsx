import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import Avatar from '../ui/Avatar';
import MessageItem from './MessageItem';
import chatService from '../../api/chat';

const MessageList = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await chatService.getMessages(conversationId, user.token);
        setMessages(data);
        await chatService.markAsRead(conversationId, user.token);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const socket = io(process.env.REACT_APP_API_URL, {
      auth: { token: user.token }
    });

    socket.emit('joinConversation', conversationId);

    socket.on('receiveMessage', (message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
        chatService.markAsRead(conversationId, user.token);
      }
    });

    socket.on('typing', (userId) => {
      if (userId !== user._id) {
        setTypingUser(userId);
        setTimeout(() => setTypingUser(null), 3000);
      }
    });

    socket.on('stopTyping', () => {
      setTypingUser(null);
    });

    return () => {
      socket.emit('leaveConversation', conversationId);
      socket.off('receiveMessage');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [conversationId, user.token, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>No messages yet</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            isCurrentUser={message.sender._id === user._id}
          />
        ))
      )}
      {typingUser && (
        <div className="flex items-center space-x-2">
          <Avatar src={typingUser.avatar} size="sm" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;