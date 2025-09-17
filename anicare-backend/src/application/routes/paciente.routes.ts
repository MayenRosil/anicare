// src/application/routes/paciente.routes.ts
import { Router } from 'express';
import { PacienteController } from '../controllers/PacienteController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

router.get('/pacientes', verifyToken, PacienteController.listar);
router.get('/pacientes/:id', verifyToken, PacienteController.obtenerPorId);
router.get('/pacientes/propietario/:id_propietario', verifyToken, PacienteController.obtenerPorPropietario);
router.post('/pacientes', verifyToken, PacienteController.crear);

export default router;
