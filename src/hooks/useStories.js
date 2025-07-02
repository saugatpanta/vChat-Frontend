import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import storyService from '../api/stories';

export const useStories = () => {
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

  const createStory = async (formData) => {
    try {
      const { data } = await storyService.createStory(formData, user.token);
      setStories((prev) => {
        const existingUserIndex = prev.findIndex(
          (s) => s.user._id === data.user._id
        );
        if (existingUserIndex >= 0) {
          const updated = [...prev];
          updated[existingUserIndex].stories.push(data);
          return updated;
        } else {
          return [
            ...prev,
            {
              user: data.user,
              stories: [data]
            }
          ];
        }
      });
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return { stories, loading, createStory };
};