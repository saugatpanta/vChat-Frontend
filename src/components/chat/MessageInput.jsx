import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { PaperClipIcon, MicrophoneIcon, VideoCameraIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import EmojiPicker from './EmojiPicker';
import Button from '../ui/Button';
import chatService from '../../api/chat';

const MessageInput = ({ conversationId, onSendMessage }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      auth: { token: user.token }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user.token]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', { conversationId, userId: user._id });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBlur = () => {
    if (isTyping) {
      setIsTyping(false);
      socketRef.current.emit('stopTyping', { conversationId });
    }
  };

  const handleSendMessage = async () => {
    if (text.trim() === '') return;

    try {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('text', text);
      formData.append('isMedia', false);

      const { data } = await chatService.sendMessage(formData, user.token);
      onSendMessage(data);
      setText('');
      setShowEmojiPicker(false);

      if (isTyping) {
        setIsTyping(false);
        socketRef.current.emit('stopTyping', { conversationId });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('media', file);
      formData.append('isMedia', true);

      const { data } = await chatService.sendMessage(formData, user.token);
      onSendMessage(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji.native);
  };

  const startVideoCall = async (isVideo) => {
    try {
      const { data } = await chatService.startVideoCall(
        {
          recipientId: conversationId,
          isVideo
        },
        user.token
      );
      onSendMessage(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative p-4 border-t border-gray-200">
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-0">
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-indigo-600"
          onClick={() => fileInputRef.current.click()}
        >
          <PaperClipIcon className="h-5 w-5" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*"
          />
        </button>
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-indigo-600"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <FaceSmileIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-indigo-600"
          onClick={() => startVideoCall(false)}
        >
          <MicrophoneIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-indigo-600"
          onClick={() => startVideoCall(true)}
        >
          <VideoCameraIcon className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Type a message"
            rows="1"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </div>
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default MessageInput;