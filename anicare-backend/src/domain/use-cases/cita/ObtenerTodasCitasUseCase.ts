import { ICitaRepository } from '../../interfaces/ICitaRepository';
import { Cita } from '../../entities/Cita';

export class ObtenerTodasCitasUseCase {
  constructor(private citaRepository: ICitaRepository) {}

  async execute(): Promise<Cita[]> {
    return await this.citaRepository.obtenerTodos();
  }
}
