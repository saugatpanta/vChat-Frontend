import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import storyService from '../../api/stories';

const StoriesList = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await storyService.getStories(user.token);
        setStories(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [user.token]);

  if (loading) {
    return (
      <div className="flex space-x-4 overflow-x-auto py-4 px-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="animate-pulse h-16 w-16 rounded-full bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-4 overflow-x-auto py-4 px-4">
      <Link
        to="/stories/create"
        className="flex-shrink-0 flex flex-col items-center"
      >
        <div className="relative">
          <Avatar src={user.avatar} size="lg" />
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
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
          </div>
        </div>
        <span className="text-xs mt-1 text-gray-700">Your Story</span>
      </Link>

      {stories.map((story) => (
        <Link
          key={story.user._id}
          to={`/stories/${story.user._id}`}
          className="flex-shrink-0 flex flex-col items-center"
        >
          <div className="relative">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600">
              <Avatar src={story.user.avatar} size="lg" hasBorder />
            </div>
            {story.stories.some((s) => !s.viewers.includes(user._id)) && (
              <Badge className="absolute -top-1 -right-1 bg-red-500" />
            )}
          </div>
          <span className="text-xs mt-1 text-gray-700">
            {story.user.username}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default StoriesList;