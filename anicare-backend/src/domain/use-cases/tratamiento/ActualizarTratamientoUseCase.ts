import { ITratamientoRepository } from '../../interfaces/ITratamientoRepository';
import { Tratamiento } from '../../entities/Tratamiento';

export class ActualizarTratamientoUseCase {
  constructor(private tratamientoRepository: ITratamientoRepository) {}

  async execute(id: number, data: Partial<Tratamiento>): Promise<void> {
    await this.tratamientoRepository.actualizar(id, data);
  }
}
