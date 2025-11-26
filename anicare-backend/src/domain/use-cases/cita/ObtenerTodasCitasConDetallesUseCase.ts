// src/domain/use-cases/cita/ObtenerTodasCitasConDetallesUseCase.ts
import { ICitaRepository } from '../../interfaces/ICitaRepository';

export class ObtenerTodasCitasConDetallesUseCase {
  constructor(private citaRepository: ICitaRepository) {}

  async execute(): Promise<any[]> {
    return await this.citaRepository.obtenerTodasConDetalles();
  }
}