import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.REACT_APP_API_URL, {
        auth: { token: user.token }
      });
      setSocket(newSocket);

      newSocket.on('receiveMessage', (message) => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === message.conversation
              ? {
                  ...conv,
                  lastMessage: message,
                  unreadCount:
                    activeConversation !== message.conversation
                      ? conv.unreadCount + 1
                      : 0
                }
              : conv
          )
        );

        if (activeConversation !== message.conversation) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user, activeConversation]);

  const value = {
    socket,
    activeConversation,
    setActiveConversation,
    conversations,
    setConversations,
    unreadCount,
    setUnreadCount
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);