"use client";

import React, { useState, useEffect } from 'react';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatComposer } from '@/components/ChatComposer';
import { ConversionPreview } from '@/components/ConversionPreview';
import { MetricsModal } from '@/components/MetricsModal';
import { Search, ChevronLeft, MoreHorizontal, User, BarChart2, Menu } from 'lucide-react';
import { draftsApi } from '@/lib/api';

// Mock Threads
const MOCK_THREADS = [
    { id: '1', name: 'Sarah Johnson', lastMsg: 'Project Update Q4', time: '10:30 AM' },
    { id: '2', name: 'John Doe', lastMsg: 'Hey team, just checking...', time: 'Yesterday' },
    { id: '3', name: 'Product Launch', lastMsg: 'Review the latest specs', time: 'Monday' },
];

export default function Dashboard() {
    const [selectedThread, setSelectedThread] = useState(MOCK_THREADS[0]);
    const [messages, setMessages] = useState<any[]>([
        { id: '1', sender: 'Sarah Johnson', content: 'Hey, I just updated the Q4 spreadsheet. Can you take a look?', isOutgoing: false },
        { id: '2', sender: 'You', content: 'Got it, looking now. Will send the report by Friday!', isOutgoing: true },
    ]);

    const [isConverting, setIsConverting] = useState(false);
    const [isMetricsOpen, setIsMetricsOpen] = useState(false);
    const [pendingDraft, setPendingDraft] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleConvert = async (text: string) => {
        setLoading(true);
        try {
            const response = await draftsApi.convert({
                userInput: text,
                recipientName: selectedThread.name,
                threadId: selectedThread.id
            });

            setPendingDraft({
                id: response.draftId,
                subject: response.convertedEmail.subject,
                body: response.convertedEmail.body
            });
            setIsConverting(true);
        } catch (error: any) {
            alert("Conversion failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = (text: string) => {
        const newMsg = {
            id: Date.now().toString(),
            sender: 'You',
            content: text,
            isOutgoing: true
        };
        setMessages(prev => [...prev, newMsg]);
    };

    const confirmSend = async () => {
        if (!pendingDraft) return;

        setLoading(true);
        try {
            await draftsApi.send(pendingDraft.id, {
                subject: pendingDraft.subject,
                recipientEmail: selectedThread.name // Or keep actual email if available
            });
            handleSend(pendingDraft.body);
            setIsConverting(false);
            setPendingDraft(null);
        } catch (error: any) {
            alert("Failed to send: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#121212] text-[#E6EDF3] overflow-hidden relative">
            {/* Sidebar - Thread List */}
            <div className={`
        fixed inset-y-0 left-0 z-40 w-80 border-r border-[#30363D] bg-[#161B22] flex flex-col transition-transform duration-300 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
                <div className="p-4 flex items-center justify-between border-b border-[#30363D]">
                    <h1 className="text-xl font-black italic tracking-tighter text-[#007AFF]">EmailFlow</h1>
                    <button
                        onClick={() => setIsMetricsOpen(true)}
                        className="p-2 text-[#8B949E] hover:text-[#007AFF] transition-colors"
                    >
                        <BarChart2 size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-[#8B949E]" size={16} />
                        <input
                            placeholder="Search conversations..."
                            className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl py-2 pl-10 text-sm outline-none focus:border-[#007AFF] transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {MOCK_THREADS.map(thread => (
                        <div
                            key={thread.id}
                            onClick={() => {
                                setSelectedThread(thread);
                                if (window.innerWidth < 768) setSidebarOpen(false);
                            }}
                            className={`p-4 cursor-pointer hover:bg-[#30363D]/30 transition-colors border-b border-[#30363D]/50 ${selectedThread.id === thread.id ? 'bg-[#30363D]/50 border-r-4 border-[#007AFF]' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm">{thread.name}</span>
                                <span className="text-[10px] text-[#8B949E] font-bold uppercase">{thread.time}</span>
                            </div>
                            <p className="text-xs text-[#8B949E] truncate leading-relaxed">{thread.lastMsg}</p>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-[#30363D] bg-[#0D1117] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#007AFF] flex items-center justify-center font-bold text-white shadow-lg">
                        JD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">John Doe</p>
                        <p className="text-[10px] text-[#8B949E] truncate">john@example.com</p>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="h-16 border-b border-[#30363D] flex items-center justify-between px-4 bg-[#121212] sticky top-0 z-30">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden text-[#8B949E] p-1"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1E1E1E] border border-[#30363D] flex items-center justify-center text-[10px] font-bold">
                                {selectedThread.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-bold text-sm truncate">{selectedThread.name}</h2>
                                <p className="text-[10px] text-[#007AFF] font-bold uppercase tracking-widest truncate">{selectedThread.lastMsg}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-[#8B949E] hover:bg-[#1E1E1E] rounded-full transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 custom-scrollbar bg-gradient-to-b from-[#121212] to-[#0d0d0d]">
                    {messages.map(msg => (
                        <MessageBubble
                            key={msg.id}
                            content={msg.content}
                            senderName={msg.sender}
                            isOutgoing={msg.isOutgoing}
                        />
                    ))}
                    {loading && (
                        <div className="flex justify-center py-4">
                            <div className="flex gap-1 animate-pulse">
                                {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 bg-[#007AFF] rounded-full" />)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <ChatComposer
                        onConvert={handleConvert}
                        onSend={handleSend}
                        placeholder={loading ? "AI is thinking..." : "Type a quick note..."}
                    />
                </div>
            </div>

            {/* Modals */}
            {isConverting && pendingDraft && (
                <ConversionPreview
                    draft={pendingDraft}
                    onCancel={() => setIsConverting(false)}
                    onConfirm={confirmSend}
                />
            )}

            <MetricsModal
                isOpen={isMetricsOpen}
                onClose={() => setIsMetricsOpen(false)}
            />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
