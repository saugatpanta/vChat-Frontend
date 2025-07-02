import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Notifications
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Enable notifications</span>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account</h2>
          <Button variant="danger">Delete Account</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;