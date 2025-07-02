import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import userService from '../../api/users';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await userService.getUser(id);
        setProfile(data.user);
        setIsFollowing(
          user?.following.includes(data.user._id) || false
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(profile._id, user.token);
      } else {
        await userService.followUser(profile._id, user.token);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <div>User not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
        <div className="flex-shrink-0">
          <Avatar src={profile.avatar} size="xl" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.username}
              </h1>
              <p className="text-gray-600 mt-1">{profile.bio}</p>
            </div>
            {user._id !== profile._id && (
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? 'secondary' : 'primary'}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            )}
          </div>
          <div className="flex space-x-8 mt-6">
            <div className="text-center">
              <span className="font-bold text-gray-900">
                {profile.followers.length}
              </span>
              <span className="block text-sm text-gray-600">Followers</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-gray-900">
                {profile.following.length}
              </span>
              <span className="block text-sm text-gray-600">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;