"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // Store in localStorage for the API client
            localStorage.setItem('jwt_token', token);

            // Set a cookie so the server-side middleware can see it
            document.cookie = `jwt_token=${token}; path=/; max-age=86400; SameSite=Lax`;

            // Redirect to dashboard
            router.push('/dashboard');
        } else {
            // Handle error
            router.push('/login?error=no_token');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <div className="text-[#007AFF] animate-pulse font-bold tracking-widest uppercase">
                Authenticating...
            </div>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
