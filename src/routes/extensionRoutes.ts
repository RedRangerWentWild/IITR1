import { Router } from 'express';
import { getDraftContext, validateOAuth } from '../controllers/extensionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/get-draft-context', getDraftContext);
router.post('/validate-oauth', validateOAuth);

export default router;
