"use client";

import React from 'react';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();

    const handleLogin = () => {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        window.location.href = `${API_BASE}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm text-center space-y-8">
                <div className="space-y-2">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-[#007AFF] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#007AFF]/20 animate-pulse">
                            <Mail className="text-white" size={32} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-[#E6EDF3]">EmailFlow</h1>
                    <p className="text-[#8B949E] text-sm font-medium">Professionalize your thoughts instantly.</p>
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full bg-[#E6EDF3] text-[#121212] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-[0.98] shadow-lg"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    <span>Continue with Google</span>
                </button>

                <p className="text-[10px] text-[#8B949E] uppercase tracking-widest font-bold">
                    AI-Powered Email Drafting Assistant
                </p>
            </div>
        </div>
    );
}
