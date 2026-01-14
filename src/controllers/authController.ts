import { Request, Response } from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { config } from '../config';

export const oauth2Client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
);

const getJwtForCode = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.email) {
        throw new Error('Google account must have an email');
    }

    // Upsert user
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: googleUser.email,
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
                tokenExpiresAt: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
                userToneProfile: { casual: 0, neutral: 50, formal: 50 },
            },
        });
    } else {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token || user.googleRefreshToken,
                tokenExpiresAt: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
            },
        });
    }

    return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: '1h',
    });
};

export const googleLogin = async (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Authorization code is required' });

    try {
        const token = await getJwtForCode(code);
        res.json({ accessToken: token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error instanceof Error ? error.message : error });
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) return res.redirect(`${config.google.redirectUri!.replace('/auth/google/callback', '')}/login?error=no_code`);

    try {
        const token = await getJwtForCode(code as string);
        // Redirect to frontend callback
        const frontendUrl = 'http://localhost:3001'; // Default frontend port we set
        res.redirect(`${frontendUrl}/callback?token=${token}`);
    } catch (error) {
        console.error('Callback error:', error);
        res.redirect('http://localhost:3001/login?error=callback_failed');
    }
};

export const refresh = async (req: Request, res: Response) => {
    // Logic for refreshing internal JWT - simplified for now
    // In a real app we might verify a refresh token separately
    res.status(501).json({ error: 'Not implemented yet' });
};
