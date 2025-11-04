import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BarChart3 } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await login(credentials);
            if (result.success) {
                toast.success('Welcome to Simply Analytics!');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setCredentials((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8 animate-fade-in'>
                {/* Header */}
                <div className='text-center'>
                    <div className='mx-auto h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-lg'>
                        <BarChart3 className='h-8 w-8 text-white' />
                    </div>
                    <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                        Simply Analytics
                    </h2>
                    <p className='text-gray-600'>
                        Sign in to access your analytics dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className='bg-white shadow-xl rounded-2xl px-8 py-10 border border-gray-100'>
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor='username'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Username
                            </label>
                            <input
                                id='username'
                                name='username'
                                type='text'
                                required
                                value={credentials.username}
                                onChange={handleChange}
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200'
                                placeholder='Enter your username'
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor='password'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200'
                                    placeholder='Enter your password'
                                    disabled={isLoading}
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className='h-5 w-5' />
                                    ) : (
                                        <Eye className='h-5 w-5' />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]'
                        >
                            {isLoading ? (
                                <div className='flex items-center justify-center'>
                                    <div className='loading-spinner w-5 h-5 mr-2'></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className='mt-8 pt-6 border-t border-gray-200'>
                        <p className='text-center text-sm text-gray-500'>
                            Secure authentication powered by JWT
                        </p>
                    </div>
                </div>

                {/* Demo Info */}
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-center'>
                    <p className='text-sm text-blue-800'>
                        <strong>Demo Credentials:</strong>
                        <br />
                        Check your .env file for username and password
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
