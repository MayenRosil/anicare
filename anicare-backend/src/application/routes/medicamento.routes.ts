// src/application/routes/medicamento.routes.ts
import { Router } from 'express';
import { MedicamentoController } from '../controllers/MedicamentoController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

router.get('/medicamentos', verifyToken, MedicamentoController.listar);
router.get('/medicamentos/:id', verifyToken, MedicamentoController.obtenerPorId);
router.post('/medicamentos', verifyToken, MedicamentoController.crear);
router.put('/medicamentos/:id', verifyToken, MedicamentoController.actualizar);
router.delete('/medicamentos/:id', verifyToken, MedicamentoController.eliminar);

export default router;