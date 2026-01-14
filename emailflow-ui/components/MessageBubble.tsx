import React from 'react';
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    content: string;
    isAI?: boolean;
    senderName?: string;
    isOutgoing?: boolean;
}

export const MessageBubble = ({ content, senderName, isOutgoing }: MessageBubbleProps) => {
    return (
        <div className={cn("flex flex-col mb-4", isOutgoing ? "items-end" : "items-start")}>
            {!isOutgoing && senderName && (
                <span className="text-xs text-[#8B949E] mb-1 ml-1">{senderName}</span>
            )}
            <div
                className={cn(
                    "max-w-[80%] p-3 rounded-2xl shadow-sm text-sm",
                    isOutgoing
                        ? "bg-[#007AFF] text-white rounded-tr-none"
                        : "bg-[#1E1E1E] text-[#E6EDF3] rounded-tl-none"
                )}
            >
                {content}
            </div>
        </div>
    );
};
