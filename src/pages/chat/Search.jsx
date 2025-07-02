import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import userService from '../../api/users';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data } = await userService.searchUsers(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Search</h2>
      <form onSubmit={handleSearch}>
        <Input
          type="text"
          placeholder="Search for users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      {loading ? (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {results.map((user) => (
            <div
              key={user._id}
              className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              <Avatar src={user.avatar} size="md" />
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;