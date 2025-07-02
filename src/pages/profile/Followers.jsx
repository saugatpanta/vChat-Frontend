import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import userService from '../../api/users';

const Followers = () => {
  const { id } = useParams();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const { data } = await userService.getUser(id);
        setFollowers(data.user.followers);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Followers</h1>
      <div className="space-y-4">
        {followers.length === 0 ? (
          <p className="text-gray-500">No followers yet</p>
        ) : (
          followers.map((follower) => (
            <div
              key={follower._id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Avatar src={follower.avatar} size="md" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {follower.username}
                  </h3>
                </div>
              </div>
              {user._id !== follower._id && (
                <Button variant="secondary" size="sm">
                  {user.following.includes(follower._id)
                    ? 'Following'
                    : 'Follow'}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Followers;