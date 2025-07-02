import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { FiSearch, FiMessageSquare, FiUsers } from 'react-icons/fi';
import { RiHome4Line, RiSettingsLine } from 'react-icons/ri';
import { BsPlusSquare } from 'react-icons/bs';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const Sidebar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) return null;

  const navItems = [
    {
      icon: <RiHome4Line className="h-6 w-6" />,
      label: 'Home',
      path: '/',
      badge: false
    },
    {
      icon: <FiSearch className="h-6 w-6" />,
      label: 'Search',
      path: '/search',
      badge: false
    },
    {
      icon: <FiMessageSquare className="h-6 w-6" />,
      label: 'Messages',
      path: '/chat',
      badge: true
    },
    {
      icon: <IoMdNotificationsOutline className="h-6 w-6" />,
      label: 'Notifications',
      path: '/notifications',
      badge: true
    },
    {
      icon: <BsPlusSquare className="h-6 w-6" />,
      label: 'Create',
      path: '/create',
      badge: false
    },
    {
      icon: <FiUsers className="h-6 w-6" />,
      label: 'Community',
      path: '/community',
      badge: false
    },
    {
      icon: <RiSettingsLine className="h-6 w-6" />,
      label: 'Settings',
      path: '/settings',
      badge: false
    }
  ];

  return (
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 pt-16 bg-white border-r border-gray-200">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6">
          <div className="space-y-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500" />
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <Link
          to={`/profile/${user?._id}`}
          className="flex items-center space-x-3"
        >
          <Avatar src={user?.avatar} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500">View profile</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;