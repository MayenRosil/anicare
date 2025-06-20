// src/application/controllers/AuthController.ts
import { Request, Response } from 'express';
import { UsuarioRepository } from '../../infrastructure/repositories/UsuarioRepository';
import { LoginUseCase } from '../../domain/use-cases/LoginUseCase';
import generateToken from '../../shared/utils/generateToken';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { correo, contraseña } = req.body;
    try {
      const repo = new UsuarioRepository();
      const loginUseCase = new LoginUseCase(repo);

      const usuario = await loginUseCase.execute(correo, contraseña);
      const token = generateToken(usuario.id, usuario.id_rol);

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre_usuario,
          correo: usuario.correo,
          rol: usuario.id_rol,
          ultimo_login: usuario.ultimo_login
        }
      });
    } catch (error: any) {
      res.status(401).json({ mensaje: error.message });
    }
  }
}
