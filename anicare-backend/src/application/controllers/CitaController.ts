// src/application/controllers/CitaController.ts
import { Request, Response } from 'express';
import { CitaRepository } from '../../infrastructure/repositories/CitaRepository';
import { CrearCitaUseCase } from '../../domain/use-cases/cita/CrearCitaUseCase';
import { ObtenerTodasCitasUseCase } from '../../domain/use-cases/cita/ObtenerTodasCitasUseCase';
import { ObtenerTodasCitasConDetallesUseCase } from '../../domain/use-cases/cita/ObtenerTodasCitasConDetallesUseCase';
import { ObtenerCitaPorIdUseCase } from '../../domain/use-cases/cita/ObtenerCitaPorIdUseCase';
import { ActualizarEstadoCitaUseCase } from '../../domain/use-cases/cita/ActualizarEstadoCitaUseCase';
import { ActualizarPacienteCitaUseCase } from '../../domain/use-cases/cita/ActualizarPacienteCitaUseCase';
import { AtenderCitaCompletaUseCase } from '../../domain/use-cases/cita/AtenderCitaCompletaUseCase';
import { ConsultaRepository } from '../../infrastructure/repositories/ConsultaRepository';
import { DiagnosticoConsultaRepository } from '../../infrastructure/repositories/DiagnosticoConsultaRepository';
import { TratamientoRepository } from '../../infrastructure/repositories/TratamientoRepository';

export class CitaController {
  // ✨ MODIFICADO: Agregar lógica para crear consulta solo si NO es grooming
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

  static async listarConDetalles(req: Request, res: Response): Promise<void> {
    try {
      const repo = new CitaRepository();
      const useCase = new ObtenerTodasCitasConDetallesUseCase(repo);
      const citas = await useCase.execute();
      res.json(citas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener citas con detalles', error });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new CitaRepository();
      const useCase = new ObtenerCitaPorIdUseCase(repo);
      const cita = await useCase.execute(id);
      if (!cita) {
        res.status(404).json({ mensaje: 'Cita no encontrada' });
        return;
      }
      res.json(cita);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener cita', error });
    }
  }

  static async actualizarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { estado } = req.body;
      const repo = new CitaRepository();
      const useCase = new ActualizarEstadoCitaUseCase(repo);
      await useCase.execute(id, estado);
      res.json({ mensaje: 'Estado actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar estado', error });
    }
  }

  static async actualizarPaciente(req: Request, res: Response): Promise<void> {
    try {
      const idCita = parseInt(req.params.id);
      const { id_paciente } = req.body;

      if (!id_paciente) {
        res.status(400).json({ mensaje: 'El id_paciente es requerido' });
        return;
      }

      const repo = new CitaRepository();
      const useCase = new ActualizarPacienteCitaUseCase(repo);
      await useCase.execute(idCita, id_paciente);
      
      res.json({ mensaje: 'Paciente asignado a la cita correctamente' });
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message || 'Error al actualizar paciente de la cita', error });
    }
  }

  static async atenderCompleta(req: Request, res: Response): Promise<void> {
    try {
      const idCita = parseInt(req.params.id);
      const citaRepo = new CitaRepository();
      const consultaRepo = new ConsultaRepository();
      const diagnosticoRepo = new DiagnosticoConsultaRepository();
      const tratamientoRepo = new TratamientoRepository();

      const useCase = new AtenderCitaCompletaUseCase(
        citaRepo,
        consultaRepo,
        diagnosticoRepo,
        tratamientoRepo
      );

      const idConsulta = await useCase.execute(idCita);
      res.json({ 
        mensaje: 'Cita atendida correctamente',
        id_consulta: idConsulta
      });
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message || 'Error al atender cita', error });
    }
  }
}