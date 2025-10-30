// anicare-backend/src/application/routes/movimientoInventario.routes.ts
import { Router } from 'express';
import { MovimientoInventarioController } from '../controllers/MovimientoInventarioController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

// Registrar un nuevo movimiento (entrada o salida)
router.post('/movimientos-inventario', verifyToken, MovimientoInventarioController.registrarMovimiento);

// Obtener movimientos por medicamento
router.get('/movimientos-inventario/medicamento/:id_medicamento', verifyToken, MovimientoInventarioController.obtenerPorMedicamento);

// Obtener todos los movimientos
router.get('/movimientos-inventario', verifyToken, MovimientoInventarioController.obtenerTodos);

export default router;