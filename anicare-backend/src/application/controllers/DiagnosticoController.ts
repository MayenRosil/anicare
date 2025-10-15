// src/application/controllers/DiagnosticoController.ts
import { Request, Response } from 'express';
import { DiagnosticoConsultaRepository } from '../../infrastructure/repositories/DiagnosticoConsultaRepository';
import { CrearDiagnosticoUseCase } from '../../domain/use-cases/diagnostico/CrearDiagnosticoUseCase';
import { ObtenerDiagnosticosPorConsultaUseCase } from '../../domain/use-cases/diagnostico/ObtenerDiagnosticosPorConsultaUseCase';
import { ActualizarDiagnosticoUseCase } from '../../domain/use-cases/diagnostico/ActualizarDiagnosticoUseCase';

export class DiagnosticoController {
  // 🆕 Crear diagnóstico
  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const repo = new DiagnosticoConsultaRepository();
      const useCase = new CrearDiagnosticoUseCase(repo);
      const idDiagnostico = await useCase.execute(req.body);
      res.status(201).json({ 
        mensaje: 'Diagnóstico creado exitosamente', 
        id: idDiagnostico 
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear diagnóstico', error });
    }
  }

  // Obtener diagnósticos por consulta
  static async obtenerPorConsulta(req: Request, res: Response): Promise<void> {
    try {
      const idConsulta = parseInt(req.params.idConsulta);
      const repo = new DiagnosticoConsultaRepository();
      const useCase = new ObtenerDiagnosticosPorConsultaUseCase(repo);
      const diagnosticos = await useCase.execute(idConsulta);
      res.json(diagnosticos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener diagnósticos', error });
    }
  }

  // Actualizar diagnóstico
  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new DiagnosticoConsultaRepository();
      const useCase = new ActualizarDiagnosticoUseCase(repo);
      await useCase.execute(id, req.body);
      res.json({ mensaje: 'Diagnóstico actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar diagnóstico', error });
    }
  }
}