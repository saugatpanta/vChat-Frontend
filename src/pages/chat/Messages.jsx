import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatHeader from '../../components/chat/ChatHeader';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';

const Messages = () => {
  const { conversationId } = useParams();
  const { setActiveConversation } = useChat();

  useEffect(() => {
    setActiveConversation(conversationId);
    return () => setActiveConversation(null);
  }, [conversationId, setActiveConversation]);

  return (
    <div className="h-full flex flex-col">
      <ChatHeader />
      <MessageList conversationId={conversationId} />
      <MessageInput conversationId={conversationId} />
    </div>
  );
};

export default Messages;