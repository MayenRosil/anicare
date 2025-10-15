// src/application/controllers/MedicamentoController.ts
import { Request, Response } from 'express';
import { MedicamentoRepository } from '../../infrastructure/repositories/MedicamentoRepository';
import { CrearMedicamentoUseCase } from '../../domain/use-cases/medicamento/CrearMedicamentoUseCase';
import { ObtenerTodosMedicamentosUseCase } from '../../domain/use-cases/medicamento/ObtenerTodosMedicamentosUseCase';
import { ObtenerMedicamentoPorIdUseCase } from '../../domain/use-cases/medicamento/ObtenerMedicamentoPorIdUseCase';
import { ActualizarMedicamentoUseCase } from '../../domain/use-cases/medicamento/ActualizarMedicamentoUseCase';
import { EliminarMedicamentoUseCase } from '../../domain/use-cases/medicamento/EliminarMedicamentoUseCase';

export class MedicamentoController {
  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const repo = new MedicamentoRepository();
      const useCase = new CrearMedicamentoUseCase(repo);
      const id = await useCase.execute(req.body);
      
      res.status(201).json({ 
        mensaje: 'Medicamento creado correctamente',
        id 
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear medicamento', error });
    }
  }

  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const repo = new MedicamentoRepository();
      const useCase = new ObtenerTodosMedicamentosUseCase(repo);
      const medicamentos = await useCase.execute();
      res.json(medicamentos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar medicamentos', error });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new MedicamentoRepository();
      const useCase = new ObtenerMedicamentoPorIdUseCase(repo);
      const medicamento = await useCase.execute(id);
      
      if (!medicamento) {
        res.status(404).json({ mensaje: 'Medicamento no encontrado' });
        return;
      }
      
      res.json(medicamento);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener medicamento', error });
    }
  }

  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new MedicamentoRepository();
      const useCase = new ActualizarMedicamentoUseCase(repo);
      await useCase.execute(id, req.body);
      res.json({ mensaje: 'Medicamento actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar medicamento', error });
    }
  }

  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new MedicamentoRepository();
      const useCase = new EliminarMedicamentoUseCase(repo);
      await useCase.execute(id);
      res.json({ mensaje: 'Medicamento eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al eliminar medicamento', error });
    }
  }
}