// src/application/routes/usuario.routes.ts
import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { verifyToken } from '../middlewares/validarToken';

const router = Router();

// Ruta protegida de prueba
router.get('/usuarios', verifyToken, UsuarioController.listarTodos);

export default router;
