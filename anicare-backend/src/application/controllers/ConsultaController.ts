import { Request, Response } from 'express';
import { ConsultaRepository } from '../../infrastructure/repositories/ConsultaRepository';
import { ObtenerConsultaPorIdUseCase } from '../../domain/use-cases/consulta/ObtenerConsultaPorIdUseCase';
import { ActualizarConsultaUseCase } from '../../domain/use-cases/consulta/ActualizarConsultaUseCase';
import { ObtenerConsultasPorPacienteUseCase } from '../../domain/use-cases/consulta/ObtenerConsultasPorPacienteUseCase';

export class ConsultaController {
  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new ConsultaRepository();
      const useCase = new ObtenerConsultaPorIdUseCase(repo);
      const consulta = await useCase.execute(id);
      if (!consulta) {
        res.status(404).json({ mensaje: 'Consulta no encontrada' });
        return;
      }
      res.json(consulta);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener consulta', error });
    }
  }

    static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new ConsultaRepository();
      const useCase = new ActualizarConsultaUseCase(repo);
      await useCase.execute(id, req.body);
      res.json({ mensaje: 'Consulta actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar consulta', error });
    }
  }


    static async listarPorPaciente(req: Request, res: Response): Promise<void> {
    try {
      const idPaciente = parseInt(req.params.id);
      const useCase = new ObtenerConsultasPorPacienteUseCase(new ConsultaRepository());
      const consultas = await useCase.execute(idPaciente);
      res.json(consultas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener historial clínico del paciente', error });
    }
  }
}
