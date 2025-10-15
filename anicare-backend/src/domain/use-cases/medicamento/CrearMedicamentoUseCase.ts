import { IMedicamentoRepository } from '../../interfaces/IMedicamentoRepository';
import { Medicamento } from '../../entities/Medicamento';

export class CrearMedicamentoUseCase {
  constructor(private medicamentoRepository: IMedicamentoRepository) {}

  async execute(data: Omit<Medicamento, 'id'>): Promise<number> {
    return await this.medicamentoRepository.crear(data);
  }
}