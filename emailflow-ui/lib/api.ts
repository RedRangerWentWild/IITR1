"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface DraftInput {
    userInput: string;
    recipientName?: string;
    recipientEmail?: string;
    threadId?: string;
    originalEmailBody?: string;
}

export const apiRequest = async (endpoint: string, options?: RequestInit) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
    });

    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('jwt_token');
            window.location.href = '/login';
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API Request Failed');
    }

    return response.json();
};

export const draftsApi = {
    convert: (data: DraftInput) =>
        apiRequest('/drafts/convert', { method: 'POST', body: JSON.stringify(data) }),

    send: (draftId: string, data?: { subject?: string; recipientEmail?: string; userEdits?: string; threadId?: string }) =>
        apiRequest(`/drafts/${draftId}/send`, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        }),
};

export const metricsApi = {
    getUserStats: () => apiRequest('/metrics/user-stats'),
};
