import { ICitaRepository } from '../interfaces/ICitaRepository';

export class ActualizarEstadoCitaUseCase {
  constructor(private citaRepository: ICitaRepository) {}

  async execute(id: number, estado: 'Pendiente' | 'Atendida' | 'Cancelada'): Promise<void> {
    await this.citaRepository.actualizarEstado(id, estado);
  }
}
