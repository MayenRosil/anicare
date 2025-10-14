import { Router } from 'express';
import { DiagnosticoController } from '../controllers/DiagnosticoController';

const router = Router();

router.get('/consulta/:idConsulta', DiagnosticoController.obtenerPorConsulta);
router.put('/:id', DiagnosticoController.actualizar);


export default router;
