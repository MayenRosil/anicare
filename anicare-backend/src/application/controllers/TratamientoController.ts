// src/application/controllers/TratamientoController.ts
import { Request, Response } from 'express';
import { TratamientoRepository } from '../../infrastructure/repositories/TratamientoRepository';
import { DiagnosticoConsultaRepository } from '../../infrastructure/repositories/DiagnosticoConsultaRepository';
import { CrearTratamientoUseCase } from '../../domain/use-cases/tratamiento/CrearTratamientoUseCase';
import { ObtenerTratamientosPorConsultaUseCase } from '../../domain/use-cases/tratamiento/ObtenerTratamientosPorConsultaUseCase';
import { ActualizarTratamientoUseCase } from '../../domain/use-cases/tratamiento/ActualizarTratamientoUseCase';

export class TratamientoController {
  // 🆕 Crear tratamiento
  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const repo = new TratamientoRepository();
      const useCase = new CrearTratamientoUseCase(repo);
      const idTratamiento = await useCase.execute(req.body);
      res.status(201).json({ 
        mensaje: 'Tratamiento creado exitosamente', 
        id: idTratamiento 
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear tratamiento', error });
    }
  }

  // Obtener tratamientos por consulta
  static async obtenerPorConsulta(req: Request, res: Response): Promise<void> {
    try {
      const idConsulta = parseInt(req.params.idConsulta);
      const useCase = new ObtenerTratamientosPorConsultaUseCase(
        new TratamientoRepository(),
        new DiagnosticoConsultaRepository()
      );
      const tratamientos = await useCase.execute(idConsulta);
      res.json(tratamientos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener tratamientos', error });
    }
  }

  // Actualizar tratamiento
  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new TratamientoRepository();
      const useCase = new ActualizarTratamientoUseCase(repo);
      await useCase.execute(id, req.body);
      res.json({ mensaje: 'Tratamiento actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar tratamiento', error });
    }
  }
}