// src/domain/use-cases/cita/ActualizarPacienteCitaUseCase.ts
import { ICitaRepository } from '../../interfaces/ICitaRepository';

export class ActualizarPacienteCitaUseCase {
  constructor(private citaRepository: ICitaRepository) {}

  /**
   * Actualiza el paciente asignado a una cita.
   * Usado cuando se completan los datos de un "PACIENTE NUEVO"
   */
  async execute(idCita: number, idPaciente: number): Promise<void> {
    // Verificar que la cita existe
    const cita = await this.citaRepository.obtenerPorId(idCita);
    if (!cita) {
      throw new Error('Cita no encontrada');
    }

    // Verificar que la cita tenga paciente null (es PACIENTE NUEVO)
    if (cita.id_paciente !== null) {
      throw new Error('Esta cita ya tiene un paciente asignado');
    }

    // Actualizar el paciente
    await this.citaRepository.actualizarPaciente(idCita, idPaciente);
  }
}