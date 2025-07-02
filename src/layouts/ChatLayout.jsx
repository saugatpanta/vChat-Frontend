import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ChatLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200">
          <Outlet />
        </div>
        <div className="flex-1 hidden md:block">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatLayout;