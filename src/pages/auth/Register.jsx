import RegisterForm from '../../components/auth/RegisterForm';

const Register = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Create a new account
      </h2>
      <RegisterForm />
    </div>
  );
};

export default Register;