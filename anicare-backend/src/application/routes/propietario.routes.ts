// src/application/routes/propietario.routes.ts
import { Router } from 'express';
import { PropietarioController } from '../controllers/PropietarioController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

router.get('/propietarios', verifyToken, PropietarioController.listar);
router.get('/propietarios/:id', verifyToken, PropietarioController.obtenerPorId);
router.post('/propietarios', verifyToken, PropietarioController.crear);

export default router;
