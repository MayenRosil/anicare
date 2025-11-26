// src/application/routes/cita.routes.ts
import { Router } from 'express';
import { CitaController } from '../controllers/CitaController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

router.post('/citas', verifyToken, CitaController.crear);
router.get('/citas', verifyToken, CitaController.listar);
router.get('/citas/detalles', verifyToken, CitaController.listarConDetalles); // ✨ NUEVO
router.get('/citas/:id', verifyToken, CitaController.obtenerPorId);
router.patch('/citas/:id/estado', verifyToken, CitaController.actualizarEstado);
router.patch('/citas/:id/paciente', verifyToken, CitaController.actualizarPaciente); // ✨ NUEVO
router.post('/citas/:id/atender', verifyToken, CitaController.atenderCompleta);

export default router;