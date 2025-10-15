// src/application/routes/tratamiento.routes.ts
import { Router } from 'express';
import { TratamientoController } from '../controllers/TratamientoController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

// 🆕 Crear tratamiento
router.post('/', verifyToken, TratamientoController.crear);

// Obtener tratamientos por consulta
router.get('/consulta/:idConsulta', verifyToken, TratamientoController.obtenerPorConsulta);

// Actualizar tratamiento
router.put('/:id', verifyToken, TratamientoController.actualizar);

export default router;