import { Router } from 'express';
import { logSurvey, getUserStats } from '../controllers/metricsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/log-survey', logSurvey);
router.get('/user-stats', getUserStats);

export default router;
