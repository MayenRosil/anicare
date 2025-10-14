import { Router } from 'express';
import { ConsultaController } from '../controllers/ConsultaController';

const router = Router();

router.get('/:id', ConsultaController.obtenerPorId);
router.put('/:id', ConsultaController.actualizar);


export default router;
