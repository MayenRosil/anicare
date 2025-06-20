// src/application/controllers/UsuarioController.ts
import { Request, Response } from 'express';
import pool from '../../shared/config/db';
import { DoctorRepository } from '../../infrastructure/repositories/DoctorRepository';
import { ObtenerTodosDoctoresUseCase } from '../../domain/use-cases/ObtenerTodosDoctoresUseCase';

export class DoctorController {
  static async listarTodos(req: Request, res: Response) : Promise<void>{
    try {
      const repo = new DoctorRepository();
      const useCase = new ObtenerTodosDoctoresUseCase(repo);
      const razas = await useCase.execute();
      res.json(razas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar razas', error });
    }
  }
}
