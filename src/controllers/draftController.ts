import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { generateEmail } from '../services/geminiService';
import { getThreadContext, sendEmail } from '../services/gmailService';
import { EmailContext } from '../types';

interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string };
}

export const convertDraft = async (req: AuthenticatedRequest, res: Response) => {
    const { userInput, recipientEmail, recipientName, threadId, originalEmailBody } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        let context: EmailContext | undefined;

        // 1. Fetch thread context if available
        // Ignore dummy threadId '1' often used during testing or placeholder
        if (threadId && threadId !== '1' && user.googleAccessToken) {
            try {
                // NOTE: In production, handle token refresh here if expired
                context = await getThreadContext(threadId, user.googleAccessToken);
            } catch (err) {
                console.warn(`Could not fetch context for thread ${threadId}:`, err);
                // Continue without context instead of failing
            }
        } else if (originalEmailBody) {
            // Fallback if only body provided
            context = {
                senderName: 'Unknown',
                subject: 'Re: (No Subject)',
                senderTone: 'neutral',
                originalContent: originalEmailBody
            };
        }

        // 2. Detect recipient formality (simplified: check past logs)
        // For now, defaulting to 'neutral' or relying on GPT to imply from context.

        // 3. Call OpenAI
        const conversion = await generateEmail(
            userInput,
            recipientName || recipientEmail,
            user.userToneProfile,
            context
        );

        // 4. Store in ConversionLog
        const log = await prisma.conversionLog.create({
            data: {
                userId: user.id,
                draftId: `draft_${Date.now()}`, // Simple ID generation
                userInput,
                recipientEmail: recipientEmail || 'unknown',
                aiOutput: conversion.body,
                detectedTone: conversion.detectedTone,
                previewShown: true,
                userEdited: false,
                sentSuccessfully: false,
                // We store the full JSON response in aiOutput? No, schema says String. 
                // We'll just store body in aiOutput and maybe subject in 'editsApplied' or ignore subject for log?
                // Actually, let's treat aiOutput as the body.
            }
        });

        // Return full result to frontend
        res.json({
            draftId: log.id, // Use the DB ID
            convertedEmail: {
                subject: conversion.subject,
                body: conversion.body,
                preview: conversion.body.substring(0, 100) + '...'
            },
            detectedTone: conversion.detectedTone,
            confidence: 0.9 // Static for now
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({
            error: 'Conversion failed',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

export const sendDraft = async (req: AuthenticatedRequest, res: Response) => {
    const { draftId } = req.params as { draftId: string };
    const { userEdits, threadId, subject: reqSubject, recipientEmail: reqRecipient } = req.body as any;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.googleAccessToken) return res.status(401).json({ error: 'User not connected to Google' });

        const log = await prisma.conversionLog.findUnique({ where: { id: draftId } });
        if (!log) return res.status(404).json({ error: 'Draft not found' });

        if (log.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        // 2. Merge edits and validate recipient
        const finalBody = typeof userEdits === 'string' ? userEdits : log.aiOutput;
        const subject = typeof reqSubject === 'string' ? reqSubject : 'New Message';

        // Simple email validation
        const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        let recipient = reqRecipient;
        if (!recipient || !isValidEmail(recipient)) {
            recipient = log.recipientEmail || 'recipient@example.com';
        }

        // If even the fallback is not a valid email (and not 'unknown'), 
        // we might still have a problem, but this covers the "Sarah Johnson" case.
        if (!isValidEmail(recipient as string)) {
            console.warn('Recipient email is still invalid after fallback:', recipient);
            return res.status(400).json({
                error: 'Invalid recipient email',
                details: `The recipient "${recipient}" is not a valid email address. Please provide a valid email.`
            });
        }

        // 3. Send via Gmail
        const result = await sendEmail(
            recipient,
            subject,
            finalBody,
            user.googleAccessToken,
            threadId as string
        );

        // 4. Update log
        const now = new Date();
        await prisma.conversionLog.update({
            where: { id: draftId },
            data: {
                sentSuccessfully: true,
                userEdited: !!userEdits,
                replyTime: now.getTime() - log.createdAt.getTime(),
                editsApplied: userEdits ? 'User edited body' : null
            }
        });

        // 5. Update UserMetrics (truncated to date only)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.userMetrics.upsert({
            where: { userId_date: { userId: user.id, date: today } },
            update: {
                repliesCompleted: { increment: 1 }
            },
            create: {
                userId: user.id,
                date: today,
                repliesCompleted: 1
            }
        });

        res.json({
            success: true,
            sentAt: now,
            messageId: result.id
        });

    } catch (error) {
        console.error('Send error:', error);
        res.status(500).json({
            error: 'Send failed',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
