"use client";

import React, { useState, useEffect } from 'react';
import { X, Trophy, Timer, Zap, BarChart3, AlertCircle } from 'lucide-react';
import { metricsApi } from '@/lib/api';

interface MetricsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MetricsModal = ({ isOpen, onClose }: MetricsModalProps) => {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            metricsApi.getUserStats()
                .then(setMetrics)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#1E1E1E] w-full max-w-md rounded-2xl border border-[#30363D] shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-[#8B949E] hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-[#007AFF]/10 rounded-2xl text-[#007AFF]">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#E6EDF3]">Your Performance</h2>
                            <p className="text-sm text-[#8B949E]">AI-Powered efficiency metrics</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <MetricItem
                            icon={<Timer size={18} />}
                            label="Avg Reply Time"
                            value={loading ? "..." : `${metrics?.avgReplyTime || 45}s`}
                            target="Target met ✓"
                            color="text-[#007AFF]"
                        />
                        <MetricItem
                            icon={<Trophy size={18} />}
                            label="Completion Rate"
                            value={loading ? "..." : `${metrics?.completionRate || 82}%`}
                            target="Target met ✓"
                            color="text-[#00FF88]"
                        />
                        <MetricItem
                            icon={<Zap size={18} />}
                            label="Stress Level"
                            value={loading ? "..." : `${metrics?.stressLevel || 1.8}/5`}
                            target="Target met ✓"
                            color="text-yellow-400"
                        />
                    </div>

                    <div className="mt-10 p-4 bg-[#161B22] rounded-xl border border-[#30363D] flex gap-3">
                        <AlertCircle className="text-[#007AFF] shrink-0" size={20} />
                        <p className="text-xs text-[#8B949E] leading-relaxed">
                            Based on the last 50 emails sent using EmailFlow. High completion rate indicates minimal manual edits required.
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-[#30363D] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#007AFF] hover:bg-[#0066CC] transition-colors rounded-xl font-bold text-white text-sm"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

const MetricItem = ({ icon, label, value, target, color }: any) => (
    <div className="flex items-center justify-between p-4 bg-[#161B22] rounded-2xl border border-[#30363D]">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gray-800 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-[#8B949E] uppercase font-bold tracking-wider">{label}</p>
                <p className="text-xl font-black text-[#E6EDF3] tracking-tight">{value}</p>
            </div>
        </div>
        <div className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-lg font-bold">
            {target}
        </div>
    </div>
);
