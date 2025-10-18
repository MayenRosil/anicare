
import { Request, Response } from 'express';
import { PacienteRepository } from '../../infrastructure/repositories/PacienteRepository';
import { CrearPacienteUseCase } from '../../domain/use-cases/paciente/CrearPacienteUseCase';
import { ObtenerTodosPacientesUseCase } from '../../domain/use-cases/paciente/ObtenerTodosPacientesUseCase';
import { ObtenerPacientePorIdUseCase } from '../../domain/use-cases/paciente/ObtenerPacientePorIdUseCase';
import { ObtenerPacientesPorPropietarioUseCase } from '../../domain/use-cases/paciente/ObtenerPacientesPorPropietarioUseCase';
import { ActualizarPacienteUseCase } from '../../domain/use-cases/paciente/ActualizarPacienteUseCase';
import { EliminarPacienteUseCase } from '../../domain/use-cases/paciente/EliminarPacienteUseCase';

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

      // 🆕 Actualizar
  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new PacienteRepository();
      const useCase = new ActualizarPacienteUseCase(repo);
      await useCase.execute(id, req.body);
      res.json({ mensaje: 'Paciente actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar paciente', error });
    }
  }

  // 🆕 Eliminar
  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new PacienteRepository();
      const useCase = new EliminarPacienteUseCase(repo);
      await useCase.execute(id);
      res.json({ mensaje: 'Paciente eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al eliminar paciente', error });
    }
  }

}
