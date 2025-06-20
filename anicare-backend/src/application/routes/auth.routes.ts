// src/application/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

router.post('/login', AuthController.login);

export default router;
