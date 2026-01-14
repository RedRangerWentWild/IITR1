import React from 'react';
import { Check, X, Clipboard } from 'lucide-react';

interface ConversionPreviewProps {
    draft: {
        subject: string;
        body: string;
    };
    onCancel: () => void;
    onConfirm: () => void;
}

export const ConversionPreview = ({ draft, onCancel, onConfirm }: ConversionPreviewProps) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E1E1E] w-full max-w-lg rounded-2xl border border-[#30363D] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]">
                    <h3 className="font-semibold text-[#E6EDF3]">Formal Email Draft</h3>
                    <button onClick={onCancel} className="text-[#8B949E] hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#8B949E] tracking-wider">Subject</label>
                        <div className="p-3 bg-[#0D1117] rounded-xl border border-[#30363D] text-sm text-[#E6EDF3]">
                            {draft.subject}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#8B949E] tracking-wider">Body</label>
                        <div className="p-3 bg-[#0D1117] rounded-xl border border-[#30363D] text-sm text-[#E6EDF3] whitespace-pre-wrap min-h-[160px]">
                            {draft.body}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[#161B22] flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border border-[#30363D] text-[#E6EDF3] font-medium hover:bg-[#30363D] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-2 flex items-center justify-center gap-2 bg-[#007AFF] py-3 rounded-xl text-white font-medium hover:bg-[#0066CC] transition-colors"
                    >
                        <Check size={18} />
                        <span>Send formal draft</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
