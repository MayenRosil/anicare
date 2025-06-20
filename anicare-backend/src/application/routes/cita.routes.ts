// src/application/routes/cita.routes.ts
import { Router } from 'express';
import { CitaController } from '../controllers/CitaController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post('/citas', verifyToken, CitaController.crear);
router.get('/citas', verifyToken, CitaController.listar);
router.get('/citas/:id', verifyToken, CitaController.obtenerPorId);
router.patch('/citas/:id/estado', verifyToken, CitaController.cambiarEstado);

export default router;
