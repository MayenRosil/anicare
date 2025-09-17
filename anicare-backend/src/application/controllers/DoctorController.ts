// src/application/controllers/UsuarioController.ts
import { Request, Response } from 'express';
import pool from '../../shared/config/db';
import { DoctorRepository } from '../../infrastructure/repositories/DoctorRepository';
import { ObtenerTodosDoctoresUseCase } from '../../domain/use-cases/doctor/ObtenerTodosDoctoresUseCase';
import { CrearDoctorUseCase } from '../../domain/use-cases/doctor/CrearDoctorUseCase';

export class DoctorController {

  static async crear (req: Request, res: Response): Promise <void> {
    try{
      const repo = new DoctorRepository();
      const useCase = new CrearDoctorUseCase(repo);
      const nuevo = await useCase.execute(req.body);
      res.status(201).json(nuevo);
    }catch(error){
      res.status(500).json({mensaje: 'Error al crear doctor', error});
    }
  }

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
