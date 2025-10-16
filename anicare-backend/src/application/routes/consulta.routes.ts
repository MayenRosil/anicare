// src/application/routes/consulta.routes.ts
import { Router } from 'express';
import { ConsultaController } from '../controllers/ConsultaController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

router.get('/todas', verifyToken, ConsultaController.listarTodas);
router.get('/:id', verifyToken, ConsultaController.obtenerPorId);
router.get('/:id/completa', verifyToken, ConsultaController.obtenerConsultaCompleta); // ✨ NUEVO
router.put('/:id', verifyToken, ConsultaController.actualizar);
router.patch('/:id/finalizar', verifyToken, ConsultaController.finalizarConsulta); // ✨ NUEVO



export default router;