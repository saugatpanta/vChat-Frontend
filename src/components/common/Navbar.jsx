import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/actions/authActions';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { FiSearch, FiMessageSquare } from 'react-icons/fi';
import { RiHome4Line } from 'react-icons/ri';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            vChat
          </Link>

          {isAuthenticated && (
            <>
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <RiHome4Line className="h-6 w-6" />
                </Link>
                <Link
                  to="/chat"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <FiMessageSquare className="h-6 w-6" />
                </Link>
                <button className="text-gray-600 hover:text-indigo-600 transition-colors">
                  <IoMdNotificationsOutline className="h-6 w-6" />
                </button>
                <button className="text-gray-600 hover:text-indigo-600 transition-colors">
                  <FiSearch className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <Dropdown
                  trigger={
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <Avatar src={user?.avatar} size="sm" />
                    </button>
                  }
                  items={[
                    {
                      label: 'Profile',
                      onClick: () => navigate(`/profile/${user?._id}`)
                    },
                    {
                      label: 'Settings',
                      onClick: () => navigate('/settings')
                    },
                    {
                      label: 'Logout',
                      onClick: handleLogout
                    }
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;