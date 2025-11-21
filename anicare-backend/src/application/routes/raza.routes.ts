// anicare-backend/src/application/routes/raza.routes.ts
import { Router } from 'express';
import { RazaController } from '../controllers/RazaController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

router.post('/razas', verifyToken, RazaController.crear);
router.get('/razas', verifyToken, RazaController.listarTodos);
router.get('/razas/:id', verifyToken, RazaController.obtenerPorId);
router.get('/razas/especie/:idEspecie', verifyToken, RazaController.obtenerPorEspecie);
router.post('/razas/personalizada', verifyToken, RazaController.buscarOCrearPersonalizada); // 🆕 NUEVO
router.put('/razas/:id', verifyToken, RazaController.actualizar);
router.delete('/razas/:id', verifyToken, RazaController.eliminar);

export default router;