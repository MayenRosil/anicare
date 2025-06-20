// src/application/routes/usuario.routes.ts
import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Ruta protegida de prueba
router.get('/doctores', verifyToken, DoctorController.listarTodos);

export default router;
