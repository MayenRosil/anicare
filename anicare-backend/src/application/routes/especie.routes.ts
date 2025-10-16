// anicare-backend/src/application/routes/especie.routes.ts
import { Router } from 'express';
import { EspecieController } from '../controllers/EspecieController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

router.post('/especies', verifyToken, EspecieController.crear);
router.get('/especies', verifyToken, EspecieController.listarTodas);
router.get('/especies/:id', verifyToken, EspecieController.obtenerPorId);
router.put('/especies/:id', verifyToken, EspecieController.actualizar);
router.delete('/especies/:id', verifyToken, EspecieController.eliminar);

export default router;