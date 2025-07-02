import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Sign in to your account
      </h2>
      <LoginForm />
    </div>
  );
};

export default Login;