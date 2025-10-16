// anicare-backend/src/application/controllers/EspecieController.ts
import { Request, Response } from 'express';
import { EspecieRepository } from '../../infrastructure/repositories/EspecieRepository';
import { CrearEspecieUseCase } from '../../domain/use-cases/especie/CrearEspecieUseCase';
import { ObtenerTodasEspeciesUseCase } from '../../domain/use-cases/especie/ObtenerTodasEspeciesUseCase';
import { ObtenerEspeciePorIdUseCase } from '../../domain/use-cases/especie/ObtenerEspeciePorIdUseCase';
import { ActualizarEspecieUseCase } from '../../domain/use-cases/especie/ActualizarEspecieUseCase';
import { EliminarEspecieUseCase } from '../../domain/use-cases/especie/EliminarEspecieUseCase';

export class EspecieController {
  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const repo = new EspecieRepository();
      const useCase = new CrearEspecieUseCase(repo);
      const idEspecie = await useCase.execute(req.body);
      res.status(201).json({ 
        mensaje: 'Especie creada exitosamente', 
        id: idEspecie 
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear especie', error });
    }
  }

  static async listarTodas(req: Request, res: Response): Promise<void> {
    try {
      const repo = new EspecieRepository();
      const useCase = new ObtenerTodasEspeciesUseCase(repo);
      const especies = await useCase.execute();
      res.json(especies);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar especies', error });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new EspecieRepository();
      const useCase = new ObtenerEspeciePorIdUseCase(repo);
      const especie = await useCase.execute(id);
      
      if (!especie) {
        res.status(404).json({ mensaje: 'Especie no encontrada' });
        return;
      }
      
      res.json(especie);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener especie', error });
    }
  }

  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new EspecieRepository();
      const useCase = new ActualizarEspecieUseCase(repo);
      await useCase.execute(id, req.body);
      res.json({ mensaje: 'Especie actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar especie', error });
    }
  }

  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new EspecieRepository();
      const useCase = new EliminarEspecieUseCase(repo);
      await useCase.execute(id);
      res.json({ mensaje: 'Especie eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al eliminar especie', error });
    }
  }
}