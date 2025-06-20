import { ICitaRepository } from '../interfaces/ICitaRepository';
import { Cita } from '../entities/Cita';

export class ObtenerCitaPorIdUseCase {
  constructor(private citaRepository: ICitaRepository) {}

  async execute(id: number): Promise<Cita | null> {
    return await this.citaRepository.obtenerPorId(id);
  }
}
