// src/application/controllers/UsuarioController.ts
import { Request, Response } from 'express';
import pool from '../../shared/config/db';

export class UsuarioController {
  static async listarTodos(req: Request, res: Response) {
    try {
      const [rows] = await pool.query(
        'SELECT id, nombre_usuario, correo, id_rol, ultimo_login, activo FROM Usuario'
      );
      res.json({ usuarios: rows });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
  }
}
