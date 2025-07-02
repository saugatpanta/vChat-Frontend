import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeftIcon, XMarkIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Dropdown from '../ui/Dropdown';
import storyService from '../../api/stories';

const StoryViewer = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const progressInterval = useRef(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const { data } = await storyService.getStory(id, user.token);
        setStory(data);
        await storyService.viewStory(id, user.token);
      } catch (error) {
        console.error(error);
        navigate('/stories');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [id, user.token, navigate]);

  useEffect(() => {
    if (!story) return;

    const duration = 5000; // 5 seconds per story
    const increment = 100 / (duration / 100);

    progressInterval.current = setInterval(() => {
      if (!paused) {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            handleNext();
            return 0;
          }
          return prev + increment;
        });
      }
    }, 100);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [story, paused]);

  const handleNext = () => {
    if (currentIndex < story.stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      navigate('/stories');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handlePause = () => {
    setPaused(true);
  };

  const handleResume = () => {
    setPaused(false);
  };

  const handleDelete = async () => {
    try {
      await storyService.deleteStory(story.stories[currentIndex]._id, user.token);
      navigate('/stories');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  const currentStory = story.stories[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <button onClick={() => navigate('/stories')} className="text-white">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex-1 mx-4">
          <div className="flex space-x-1">
            {story.stories.map((_, index) => (
              <div
                key={index}
                className="h-1 bg-gray-600 rounded-full flex-1"
              >
                <div
                  className={`h-full rounded-full ${index === currentIndex ? 'bg-white' : index < currentIndex ? 'bg-white' : 'bg-gray-600'}`}
                  style={{
                    width: index === currentIndex ? `${progress}%` : '100%'
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
        {currentStory.user._id === user._id ? (
          <Dropdown
            trigger={
              <button className="text-white">
                <EllipsisHorizontalIcon className="h-6 w-6" />
              </button>
            }
            items={[
              {
                label: 'Delete',
                onClick: handleDelete
              }
            ]}
          />
        ) : (
          <div className="w-6"></div>
        )}
      </div>

      <div className="absolute top-16 left-4 z-10">
        <div className="flex items-center space-x-2">
          <Avatar src={story.user.avatar} size="sm" />
          <span className="text-white font-medium">{story.user.username}</span>
          <Badge count={currentIndex + 1} className="bg-white text-black" />
        </div>
      </div>

      <div
        className="h-full w-full flex items-center justify-center"
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        {currentStory.isMedia ? (
          currentStory.media.includes('.mp4') || currentStory.media.includes('.mov') ? (
            <video
              src={currentStory.media}
              className="h-full w-full object-contain"
              autoPlay
              loop={false}
              muted
              playsInline
            />
          ) : (
            <img
              src={currentStory.media}
              alt="Story"
              className="h-full w-full object-contain"
            />
          )
        ) : (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full w-full flex items-center justify-center">
            <p className="text-white text-xl text-center px-8">{currentStory.text}</p>
          </div>
        )}
      </div>

      <div className="absolute inset-0 flex justify-between items-center z-10">
        <button
          className="h-full w-1/3 flex items-center justify-start pl-4"
          onClick={handlePrev}
        >
          <div className="bg-black bg-opacity-50 rounded-full p-2">
            <ArrowLeftIcon className="h-6 w-6 text-white" />
          </div>
        </button>
        <button
          className="h-full w-1/3 flex items-center justify-end pr-4"
          onClick={handleNext}
        >
          <div className="bg-black bg-opacity-50 rounded-full p-2">
            <ArrowLeftIcon className="h-6 w-6 text-white transform rotate-180" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default StoryViewer;