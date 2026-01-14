"use client";

import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ChatComposerProps {
    onConvert: (text: string) => void;
    onSend: (text: string) => void;
    placeholder?: string;
}

export const ChatComposer = ({ onConvert, onSend, placeholder }: ChatComposerProps) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            setText('');
        }
    };

    return (
        <div className="composer-bg p-4 pb-8">
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-[#1E1E1E] rounded-2xl p-2 px-4 shadow-sm border border-[#30363D]">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={placeholder || "Type a quick note..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-[#E6EDF3] placeholder-[#8B949E] resize-none min-h-[44px] py-3"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        className="p-2 transition-colors hover:bg-[#30363D] rounded-full text-[#007AFF]"
                    >
                        <Send size={20} />
                    </button>
                </div>

                <button
                    onClick={() => onConvert(text)}
                    disabled={!text.trim()}
                    className={cn(
                        "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all",
                        text.trim()
                            ? "bg-[#007AFF] text-white hover:bg-[#0066CC]"
                            : "bg-[#161B22] text-[#8B949E] cursor-not-allowed border border-[#30363D]"
                    )}
                >
                    <Sparkles size={18} />
                    <span>Convert to formal email</span>
                </button>
            </div>
        </div>
    );
};
