import { Request, Response } from 'express';
import prisma from '../utils/prisma';

interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string };
}

export const getDraftContext = async (req: AuthenticatedRequest, res: Response) => {
    const { recipient } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // 1. Get recent emails to this recipient
        const recentLogs = await prisma.conversionLog.findMany({
            where: {
                userId,
                recipientEmail: recipient,
                sentSuccessfully: true
            },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        // 2. Calculate average tone or just return history
        // Simple tone profile for recipient
        const tones = recentLogs.map(l => l.detectedTone);
        const toneCounts = tones.reduce((acc, tone) => {
            acc[tone] = (acc[tone] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Find mode
        const recipientToneHistory = Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

        res.json({
            recipientToneHistory,
            userToneProfile: user.userToneProfile,
            recentEmails: recentLogs.map(l => ({
                subject: 'Subject not stored', // We didn't store subject in ConversionLog, only aiOutput (body)
                tone: l.detectedTone,
                date: l.createdAt
            }))
        });

    } catch (error) {
        console.error('Context error:', error);
        res.status(500).json({ error: 'Failed to get context' });
    }
};

export const validateOAuth = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.json({ isValid: false });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.googleAccessToken) {
            return res.json({ isValid: false });
        }

        // Check expiry
        // In BigInt, we need to compare safely
        const now = BigInt(Date.now());
        const isValid = user.tokenExpiresAt ? user.tokenExpiresAt > now : false;

        // If expired, we should try refresh? The requirements say "attempt silent refresh"
        // For now, just returning status.
        res.json({
            isValid,
            expiresIn: user.tokenExpiresAt ? Number(user.tokenExpiresAt - now) : 0
        });

    } catch (error) {
        res.json({ isValid: false });
    }
};
