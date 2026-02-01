import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Lock, Mail, Shield } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else if (data.user) {
            navigate('/onboarding');
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-600 to-purple-500 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                
                {/* Logo + Name */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-white rounded-full p-4">
                            <Home className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">HomeSwipe</h1>
                    <p className="text-orange-100">Find Your Perfect Housing</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
                    
                    {/* Error Message */}
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {errorMsg}
                        </div>
                    )}
                    
                    <form onSubmit={handleSignup}>
                        {/* Email input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input 
                                    type="email"
                                    placeholder="yourname@university.edu"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Password input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input 
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Sign Up button */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Sign in link */}
                    <div className="text-center mt-4">
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Already have an account? Sign in
                        </button>
                    </div>
                </div>

                {/* Safety Notice */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mt-6 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white">
                        Your safety is our priority. All listings verified via community credentials.
                    </p>
                </div>
            </div>
        </div>
    );
};