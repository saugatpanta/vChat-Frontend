import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { XMarkIcon, CheckIcon, FaceSmileIcon, TextIcon } from '@heroicons/react/24/outline';
import EmojiPicker from '../chat/EmojiPicker';
import storyService from '../../api/stories';

const StoryCreator = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [duration, setDuration] = useState(24);
  const [isVideo, setIsVideo] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsVideo(selectedFile.type.includes('video'));
  };

  const handleSubmit = async () => {
    if (!file && !text.trim()) return;

    try {
      const formData = new FormData();
      if (file) {
        formData.append('media', file);
        formData.append('isMedia', true);
      } else {
        formData.append('text', text);
        formData.append('isMedia', false);
      }
      formData.append('duration', duration);

      await storyService.createStory(formData, user.token);
      navigate('/stories');
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji.native);
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <button onClick={() => navigate('/stories')} className="text-white">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white rounded-full p-2"
        >
          <CheckIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="h-full w-full flex items-center justify-center">
        {file ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={URL.createObjectURL(file)}
              className="h-full w-full object-contain"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={URL.createObjectURL(file)}
              alt="Story preview"
              className="h-full w-full object-contain"
            />
          )
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="relative z-10 w-full px-8">
              <textarea
                className="w-full bg-transparent text-white text-center text-2xl placeholder-white placeholder-opacity-70 focus:outline-none resize-none"
                placeholder="Type your story text..."
                rows="4"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4 z-10">
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-gray-800 bg-opacity-70 text-white rounded-full p-3"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        {!file && (
          <>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-gray-800 bg-opacity-70 text-white rounded-full p-3"
            >
              <FaceSmileIcon className="h-6 w-6" />
            </button>
            <button className="bg-gray-800 bg-opacity-70 text-white rounded-full p-3">
              <TextIcon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center z-20">
          <div className="bg-white rounded-lg shadow-xl">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryCreator;