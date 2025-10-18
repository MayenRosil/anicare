
import { Router } from 'express';
import { PacienteController } from '../controllers/PacienteController';
import { verifyToken } from '../middlewares/validarToken';
import { ConsultaController } from '../controllers/ConsultaController';

const router = Router();

router.get('/pacientes', verifyToken, PacienteController.listar);
router.get('/pacientes/:id', verifyToken, PacienteController.obtenerPorId);
router.get('/pacientes/propietario/:id_propietario', verifyToken, PacienteController.obtenerPorPropietario);
router.post('/pacientes', verifyToken, PacienteController.crear);
router.get('/pacientes/:id/consultas', ConsultaController.listarPorPaciente); // 👈 consulta pero colgada de pacientes

// Listar todos

// Obtener por ID
router.get('/pacientes/:id', verifyToken, PacienteController.obtenerPorId);

// Crear
router.post('/pacientes', verifyToken, PacienteController.crear);

// 🆕 Actualizar
router.put('/pacientes/:id', verifyToken, PacienteController.actualizar);

// 🆕 Eliminar
router.delete('/pacientes/:id', verifyToken, PacienteController.eliminar);

export default router;
