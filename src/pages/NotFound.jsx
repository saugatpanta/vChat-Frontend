import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-9xl font-bold text-indigo-600">404</h1>
      <p className="text-2xl font-medium text-gray-900 mt-4">
        Page not found
      </p>
      <p className="text-gray-600 mt-2">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="mt-6">
        <Button>Go back home</Button>
      </Link>
    </div>
  );
};

export default NotFound;