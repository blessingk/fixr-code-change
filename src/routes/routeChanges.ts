import { Router } from 'express';
import { makeCodeChanges } from '../controllers/changeController';

const router = Router();

console.log('here')
router.post('/api/make-changes', makeCodeChanges);

export default router;
