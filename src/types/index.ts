export interface Draft {
    draftId: string;
    userId: string;
    recipientEmail: string;
    recipientName?: string;
    userInput: string;
    threadId?: string;
    originalEmailContext?: EmailContext;
    createdAt: Date;
    status: 'draft' | 'converted' | 'sent';
    convertedEmail?: {
        subject: string;
        body: string;
        preview: string;
    };
    detectedTone?: 'casual' | 'neutral' | 'formal';
}

export interface EmailContext {
    senderName: string;
    subject: string;
    senderTone: 'casual' | 'neutral' | 'formal';
    originalContent: string;
}

export interface ConversionResponse {
    subject: string;
    body: string;
    detectedTone: 'casual' | 'neutral' | 'formal';
}
