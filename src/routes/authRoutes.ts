import { Router } from 'express';
import { googleLogin, refresh, oauth2Client, googleCallback } from '../controllers/authController';

const router = Router();

router.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send']
    });
    res.redirect(url);
});

router.get('/google/callback', googleCallback);
router.post('/google-login', googleLogin);
router.post('/refresh', refresh);

export default router;
