// src/application/routes/usuario.routes.ts
import { Router } from 'express';
import { RazaController } from '../controllers/RazaController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

// Ruta protegida de prueba
router.get('/razas', verifyToken, RazaController.listarTodos);

export default router;
