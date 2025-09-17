// src/application/controllers/CitaController.ts
import { Request, Response } from 'express';
import { CitaRepository } from '../../infrastructure/repositories/CitaRepository';
import { CrearCitaUseCase } from '../../domain/use-cases/cita/CrearCitaUseCase';
import { ObtenerTodasCitasUseCase } from '../../domain/use-cases/cita/ObtenerTodasCitasUseCase';
import { ObtenerCitaPorIdUseCase } from '../../domain/use-cases/cita/ObtenerCitaPorIdUseCase';
import { ActualizarEstadoCitaUseCase } from '../../domain/use-cases/cita/ActualizarEstadoCitaUseCase';

export class CitaController {
  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const repo = new CitaRepository();
      const useCase = new CrearCitaUseCase(repo);

      const data = {
        ...req.body,
        id_usuario_registro: (req as any).usuario.id // Obtenido del token
      };

      const cita = await useCase.execute(data);
      res.status(201).json(cita);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear cita', error });
    }
  }

  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const repo = new CitaRepository();
      const useCase = new ObtenerTodasCitasUseCase(repo);
      const citas = await useCase.execute();
      res.json(citas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener citas', error });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new CitaRepository();
      const useCase = new ObtenerCitaPorIdUseCase(repo);
      const cita = await useCase.execute(id);
      if (!cita) res.status(404).json({ mensaje: 'Cita no encontrada' });
      res.json(cita);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al buscar cita', error });
    }
  }

  static async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { estado } = req.body;

      const repo = new CitaRepository();
      const useCase = new ActualizarEstadoCitaUseCase(repo);
      await useCase.execute(id, estado);

      res.json({ mensaje: 'Estado actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar estado de la cita', error });
    }
  }
}
