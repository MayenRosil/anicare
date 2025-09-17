// src/application/controllers/UsuarioController.ts
import { Request, Response } from 'express';
import pool from '../../shared/config/db';
import { RazaRepository } from '../../infrastructure/repositories/RazaRepository';
import { ObtenerTodasRazasUseCase } from '../../domain/use-cases/raza/ObtenerTodasRazasUseCase';

export class RazaController {
  static async listarTodos(req: Request, res: Response) : Promise<void>{
    try {
      const repo = new RazaRepository();
      const useCase = new ObtenerTodasRazasUseCase(repo);
      const razas = await useCase.execute();
      res.json(razas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar razas', error });
    }
  }
}
