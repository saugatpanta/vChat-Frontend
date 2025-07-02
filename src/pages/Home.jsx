import StoriesList from '../components/stories/StoriesList';
import { useStories } from '../hooks/useStories';

const Home = () => {
  const { stories, loading } = useStories();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <StoriesList />
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Feed</h2>
        <div className="text-center text-gray-500 py-8">
          <p>No posts yet. Follow people to see their posts.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;