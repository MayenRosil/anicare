import { Request, Response } from 'express';
import { TratamientoRepository } from '../../infrastructure/repositories/TratamientoRepository';
import { DiagnosticoConsultaRepository } from '../../infrastructure/repositories/DiagnosticoConsultaRepository';
import { ObtenerTratamientosPorConsultaUseCase } from '../../domain/use-cases/tratamiento/ObtenerTratamientosPorConsultaUseCase';
import { ActualizarTratamientoUseCase } from '../../domain/use-cases/tratamiento/ActualizarTratamientoUseCase';

export class TratamientoController {
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
