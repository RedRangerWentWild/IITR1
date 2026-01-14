import { Router } from 'express';
import { convertDraft, sendDraft } from '../controllers/draftController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/convert', convertDraft);
router.post('/:draftId/send', sendDraft);

export default router;
