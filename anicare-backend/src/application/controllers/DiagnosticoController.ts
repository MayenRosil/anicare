import { Request, Response } from 'express';
import { DiagnosticoConsultaRepository } from '../../infrastructure/repositories/DiagnosticoConsultaRepository';
import { ObtenerDiagnosticosPorConsultaUseCase } from '../../domain/use-cases/diagnostico/ObtenerDiagnosticosPorConsultaUseCase';
import { ActualizarDiagnosticoUseCase } from '../../domain/use-cases/diagnostico/ActualizarDiagnosticoUseCase';

export class DiagnosticoController {
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
