import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { EmailContext, ConversionResponse } from '../types';

const genAI = new GoogleGenerativeAI(config.geminiApiKey || '');
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

export const generateEmail = async (
    userInput: string,
    recipientName: string,
    userToneProfile: any,
    originalContext?: EmailContext
): Promise<ConversionResponse> => {
    const systemPrompt = `You are an email drafting assistant. Convert casual messages into professional emails.
Analyze the recipient's expected formality level and the tone of the incoming email (if replying).
Match the appropriate formality while keeping the core message.
Return a JSON object with { "subject": string, "body": string, "detectedTone": "casual"|"neutral"|"formal" }.

User Tone Profile: ${JSON.stringify(userToneProfile)}
Original Email Tone (if replying): ${originalContext?.senderTone || 'unknown'}

Rules:
- Keep it concise (1-3 paragraphs max)
- Match the formality of the incoming email (if replying)
- No signature block (system adds later)
- Use the user's natural voice but professionalized
- Return ONLY valid JSON`;

    const userPrompt = `User's casual draft: '${userInput}'
Recipient: ${recipientName}
${originalContext ? `[Context: replying to email about '${originalContext.subject}' from ${originalContext.senderName}]` : ''}
Convert to professional email with appropriate formality.`;

    const maxRetries = 3;
    let delay = 1000; // Start with 1 second delay

    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await model.generateContent({
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
                ],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            });

            const response = result.response;
            const text = response.text();

            if (!text) throw new Error('No content returned from Gemini');

            return JSON.parse(text) as ConversionResponse;
        } catch (error: any) {
            const isServiceUnavailable = error.status === 503 || error.message?.includes('503');

            if (isServiceUnavailable && i < maxRetries - 1) {
                console.warn(`Gemini overloaded (503). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue;
            }

            console.error('Gemini conversion error:', error);
            throw new Error(isServiceUnavailable ? 'Gemini is currently overloaded. Please try again in a few moments.' : 'Failed to generate email');
        }
    }
    throw new Error('Failed to generate email after multiple attempts');
};
