import { Router } from 'express';
import { TratamientoController } from '../controllers/TratamientoController';

const router = Router();

router.get('/consulta/:idConsulta', TratamientoController.obtenerPorConsulta);
router.put('/:id', TratamientoController.actualizar);


export default router;
