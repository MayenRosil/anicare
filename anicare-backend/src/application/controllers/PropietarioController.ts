// src/application/controllers/PropietarioController.ts
import { Request, Response } from 'express';
import { PropietarioRepository } from '../../infrastructure/repositories/PropietarioRepository';
import { PacienteRepository } from '../../infrastructure/repositories/PacienteRepository';
import { CrearPropietarioUseCase } from '../../domain/use-cases/propietario/CrearPropietarioUseCase';
import { ObtenerTodosPropietariosUseCase } from '../../domain/use-cases/propietario/ObtenerTodosPropietariosUseCase';
import { ObtenerPropietarioPorIdUseCase } from '../../domain/use-cases/propietario/ObtenerPropietarioPorIdUseCase';
import { ActualizarPropietarioUseCase } from '../../domain/use-cases/propietario/ActualizarPropietarioUseCase';
import { EliminarPropietarioUseCase } from '../../domain/use-cases/propietario/EliminarPropietarioUseCase';
import { ObtenerPacientesPorPropietarioUseCase } from '../../domain/use-cases/paciente/ObtenerPacientesPorPropietarioUseCase';

export class PropietarioController {
  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const repo = new PropietarioRepository();
      const useCase = new CrearPropietarioUseCase(repo);
      const nuevo = await useCase.execute(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear propietario', error });
    }
  }

  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const repo = new PropietarioRepository();
      const useCase = new ObtenerTodosPropietariosUseCase(repo);
      const propietarios = await useCase.execute();
      res.json(propietarios);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar propietarios', error });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new PropietarioRepository();
      const useCase = new ObtenerPropietarioPorIdUseCase(repo);
      const propietario = await useCase.execute(id);
      if (!propietario) {
        res.status(404).json({ mensaje: 'Propietario no encontrado' });
        return;
      }
      res.json(propietario);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al buscar propietario', error });
    }
  }

  // 🆕 Actualizar propietario
  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new PropietarioRepository();
      const useCase = new ActualizarPropietarioUseCase(repo);
      await useCase.execute(id, req.body);
      res.json({ mensaje: 'Propietario actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar propietario', error });
    }
  }

  // 🆕 Eliminar propietario
  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new PropietarioRepository();
      const useCase = new EliminarPropietarioUseCase(repo);
      await useCase.execute(id);
      res.json({ mensaje: 'Propietario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al eliminar propietario', error });
    }
  }

  // 🆕 Obtener pacientes de un propietario
  static async obtenerPacientes(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new PacienteRepository();
      const useCase = new ObtenerPacientesPorPropietarioUseCase(repo);
      const pacientes = await useCase.execute(id);
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener pacientes del propietario', error });
    }
  }
}