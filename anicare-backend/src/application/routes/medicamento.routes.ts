// src/application/routes/medicamento.routes.ts
import { Router } from 'express';
import { MedicamentoController } from '../controllers/MedicamentoController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

// Crear medicamento
router.post('/medicamentos', verifyToken, MedicamentoController.crear);

// Listar todos los medicamentos
router.get('/medicamentos', verifyToken, MedicamentoController.listarTodos);

// Obtener un medicamento por ID
router.get('/medicamentos/:id', verifyToken, MedicamentoController.obtenerPorId);

// Actualizar medicamento
router.put('/medicamentos/:id', verifyToken, MedicamentoController.actualizar);

// Eliminar medicamento
router.delete('/medicamentos/:id', verifyToken, MedicamentoController.eliminar);

export default router;