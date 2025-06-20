// src/application/controllers/PacienteController.ts
import { Request, Response } from 'express';
import { PacienteRepository } from '../../infrastructure/repositories/PacienteRepository';
import { CrearPacienteUseCase } from '../../domain/use-cases/CrearPacienteUseCase';
import { ObtenerTodosPacientesUseCase } from '../../domain/use-cases/ObtenerTodosPacientesUseCase';
import { ObtenerPacientePorIdUseCase } from '../../domain/use-cases/ObtenerPacientePorIdUseCase';
import { ObtenerPacientesPorPropietarioUseCase } from '../../domain/use-cases/ObtenerPacientesPorPropietarioUseCase';

export class PacienteController {
  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const repo = new PacienteRepository();
      const useCase = new CrearPacienteUseCase(repo);
      const nuevo = await useCase.execute(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear paciente', error });
    }
  }

  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const repo = new PacienteRepository();
      const useCase = new ObtenerTodosPacientesUseCase(repo);
      const pacientes = await useCase.execute();
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar pacientes', error });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new PacienteRepository();
      const useCase = new ObtenerPacientePorIdUseCase(repo);
      const paciente = await useCase.execute(id);
      if (!paciente) res.status(404).json({ mensaje: 'No encontrado' });
      res.json(paciente);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al buscar paciente', error });
    }
  }

  static async obtenerPorPropietario(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id_propietario);
      const repo = new PacienteRepository();
      const useCase = new ObtenerPacientesPorPropietarioUseCase(repo);
      const pacientes = await useCase.execute(id);
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al buscar pacientes por propietario', error });
    }
  }
}
