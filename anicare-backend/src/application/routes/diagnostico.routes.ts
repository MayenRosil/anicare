// src/application/routes/diagnostico.routes.ts
import { Router } from 'express';
import { DiagnosticoController } from '../controllers/DiagnosticoController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

// 🆕 Crear diagnóstico
router.post('/', verifyToken, DiagnosticoController.crear);

// Obtener diagnósticos por consulta
router.get('/consulta/:idConsulta', verifyToken, DiagnosticoController.obtenerPorConsulta);

// Actualizar diagnóstico
router.put('/:id', verifyToken, DiagnosticoController.actualizar);

export default router;