import { ICitaRepository } from '../../interfaces/ICitaRepository';
import { Cita } from '../../entities/Cita';

export class CrearCitaUseCase {
  constructor(private citaRepository: ICitaRepository) {}

  async execute(data: Omit<Cita, 'id' | 'estado'>): Promise<Cita> {
    return await this.citaRepository.crear(data);
  }
}
