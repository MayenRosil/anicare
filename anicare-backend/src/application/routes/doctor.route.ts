// src/application/routes/usuario.routes.ts
import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

// Ruta protegida de prueba
router.get('/doctores', verifyToken, DoctorController.listarTodos);
router.post('/doctores', verifyToken, DoctorController.crear)

export default router;
