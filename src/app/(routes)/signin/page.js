'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';

export default function SignIn() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check if user just registered
        if (searchParams.get('registered') === 'true') {
            setMessage('Registration successful! Please sign in.');
        }
        // Redirect if already logged in
        if (user) {
            router.replace('/dashboard');
        }
    }, [searchParams, user, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to sign in');
            }

            setIsLoading(false); // Reset loading before redirect
            router.replace('/'); // Update the signin success redirect path
            
        } catch (err) {
            setError(err.message || 'Failed to sign in. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a 
                                href="/signup" 
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Sign up
                            </a>
                        </p>
                    </div>

                    {message && (
                        <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
                            {message}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-4 rounded-md shadow-sm">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="relative block w-full h-12 rounded-lg border-0 py-1.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="relative block w-full h-12 rounded-lg border-0 py-1.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-lg h-12 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <Footer />
        </div>
    );
}
