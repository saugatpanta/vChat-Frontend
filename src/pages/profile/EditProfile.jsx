import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import userService from '../../api/users';

const schema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  bio: yup.string().max(150, 'Bio cannot be more than 150 characters')
});

const EditProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: user.username,
      bio: user.bio || ''
    }
  });

  useEffect(() => {
    setValue('username', user.username);
    setValue('bio', user.bio || '');
    setAvatarPreview(user.avatar);
  }, [user, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('bio', data.bio);
      if (data.avatar) {
        formData.append('avatar', data.avatar[0]);
      }

      const { data: updatedUser } = await userService.updateUser(
        user._id,
        formData,
        user.token
      );
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center">
          <Avatar src={avatarPreview} size="xl" />
          <label className="mt-4">
            <span className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
              Change Photo
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              {...register('avatar')}
              onChange={handleFileChange}
            />
          </label>
        </div>
        <div>
          <Input
            type="text"
            placeholder="Username"
            {...register('username')}
            error={errors.username?.message}
          />
        </div>
        <div>
          <Input
            type="text"
            placeholder="Bio"
            {...register('bio')}
            error={errors.bio?.message}
          />
        </div>
        <div>
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;