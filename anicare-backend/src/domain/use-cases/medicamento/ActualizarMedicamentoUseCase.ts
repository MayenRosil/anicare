import { IMedicamentoRepository } from '../../interfaces/IMedicamentoRepository';
import { Medicamento } from '../../entities/Medicamento';

export class ActualizarMedicamentoUseCase {
  constructor(private medicamentoRepository: IMedicamentoRepository) {}

  async execute(id: number, data: Partial<Medicamento>): Promise<void> {
    await this.medicamentoRepository.actualizar(id, data);
  }
}