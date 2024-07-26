import { Router } from 'express';
import { makeCodeChanges } from '../controllers/ChangeController';

const router = Router();

console.log('here')
router.post('/make-changes', makeCodeChanges);

export default router;
