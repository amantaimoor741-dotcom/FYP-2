import { Router } from 'express';
import type { AuthRequest } from '../middleware/auth.ts';
import { createContactMessage } from '../services/db/contact.ts';

const router = Router();

router.post('/', async (req: AuthRequest, res: any) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Bad Request', message: 'name, email, and message required' });
    return;
  }
  const entry = await createContactMessage({ userId: req.userId, name, email, message });
  res.status(201).json({ message: 'Message sent', entry });
});

export default router;
