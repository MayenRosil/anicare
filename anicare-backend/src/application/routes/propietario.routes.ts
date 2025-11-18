// src/application/routes/propietario.routes.ts
import { Router } from 'express';
import { PropietarioController } from '../controllers/PropietarioController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

// Listar todos los propietarios
router.get('/propietarios', verifyToken, PropietarioController.listar);

// Obtener propietario por ID
router.get('/propietarios/:id', verifyToken, PropietarioController.obtenerPorId);

// 🆕 Obtener pacientes de un propietario
router.get('/propietarios/:id/pacientes', verifyToken, PropietarioController.obtenerPacientes);

// Crear propietario
router.post('/propietarios', verifyToken, PropietarioController.crear);

// 🆕 Actualizar propietario
router.put('/propietarios/:id', verifyToken, PropietarioController.actualizar);

// 🆕 Eliminar propietario
router.delete('/propietarios/:id', verifyToken, PropietarioController.eliminar);

export default router;