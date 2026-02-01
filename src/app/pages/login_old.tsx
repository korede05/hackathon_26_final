import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Lock, Mail, Shield } from 'lucide-react';
import { supabase } from '../../../supabaseClient'; 

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else if (data.user) {
            navigate('/browse');
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-600 to-purple-600 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <Home className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-white">SafeHouse</h1>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
                    {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input 
                            type="email" placeholder="Email" required
                            className="w-full p-3 border rounded-xl"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input 
                            type="password" placeholder="Password" required
                            className="w-full p-3 border rounded-xl"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <button 
                        onClick={() => navigate('/signup')} 
                        className="w-full mt-4 text-sm text-blue-600 font-medium"
                    >
                        Don't have an account? Sign up
                    </button>
                </div>
            </div>
        </div>
    );
};