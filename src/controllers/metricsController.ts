import { Request, Response } from 'express';
import prisma from '../utils/prisma';

interface AuthenticatedRequest extends Request {
    user?: { id: string };
}

export const logSurvey = async (req: AuthenticatedRequest, res: Response) => {
    const { stressLevel, cognitiveLoadTLX, date } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const surveyDate = date ? new Date(date) : new Date();

        // Upsert metrics for the day
        await prisma.userMetrics.upsert({
            where: { userId_date: { userId, date: surveyDate } },
            update: {
                stressLevel,
                cognitiveLoadTLX
            },
            create: {
                userId,
                date: surveyDate,
                stressLevel,
                cognitiveLoadTLX
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Log survey error:', error);
        res.status(500).json({ error: 'Failed to log survey' });
    }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { period = '7days' } = req.query; // '7days' | '30days'

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const days = period === '30days' ? 30 : 7;
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        // 1. Query ConversionLog
        const logs = await prisma.conversionLog.findMany({
            where: {
                userId,
                createdAt: { gte: sinceDate }
            }
        });

        const sentLogs = logs.filter(l => l.sentSuccessfully);
        const replyCompletionRate = logs.length > 0 ? (sentLogs.length / logs.length) * 100 : 0;

        // Calculate avgReplyTime (in sent logs that have replyTime)
        const replyTimes = sentLogs.map(l => l.replyTime || 0).filter(t => t > 0);
        const avgReplyTime = replyTimes.length > 0
            ? replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length
            : 0;

        // 2. Query UserMetrics
        const metrics = await prisma.userMetrics.findMany({
            where: {
                userId,
                date: { gte: sinceDate }
            }
        });

        const validStress = metrics.map(m => m.stressLevel).filter(s => s !== null && s !== undefined) as number[];
        const avgStressLevel = validStress.length > 0
            ? validStress.reduce((a, b) => a + b, 0) / validStress.length
            : 0;

        const validLoad = metrics.map(m => m.cognitiveLoadTLX).filter(l => l !== null && l !== undefined) as number[];
        const avgCognitiveLoad = validLoad.length > 0
            ? validLoad.reduce((a, b) => a + b, 0) / validLoad.length
            : 0;

        // Mobile reply rate - simplified or mocked as we don't track source device in ConversionLog explicitly in this schema yet
        // Assuming 0 if not tracked. Or if we tracked it in ConversionLog. Schema didn't have source.
        // UserMetrics has `mobileReplies`.
        const totalMobileReplies = metrics.reduce((sum, m) => sum + m.mobileReplies, 0);
        const mobileReplyRate = sentLogs.length > 0 ? (totalMobileReplies / sentLogs.length) * 100 : 0;

        const totalAbandonment = metrics.reduce((sum, m) => sum + m.draftAbandonmentCount, 0);
        // OR approximation: logs not sent? logs.length - sentLogs.length
        const draftAbandonmentRate = logs.length > 0
            ? ((logs.length - sentLogs.length) / logs.length) * 100
            : 0;

        const emailCheckFrequency = 18; // Default or fetched from User profile if updated

        res.json({
            avgReplyTime,
            replyCompletionRate,
            avgStressLevel,
            avgCognitiveLoad,
            mobileReplyRate,
            draftAbandonmentRate,
            emailCheckFrequency,
            period
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
