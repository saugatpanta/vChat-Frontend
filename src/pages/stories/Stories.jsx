import StoriesList from '../../components/stories/StoriesList';
import { useStories } from '../../hooks/useStories';

const Stories = () => {
  const { stories, loading } = useStories();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Stories</h2>
      <StoriesList />
    </div>
  );
};

export default Stories;