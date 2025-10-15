// src/domain/use-cases/medicamento/ObtenerMedicamentoPorIdUseCase.ts
import { IMedicamentoRepository } from '../../interfaces/IMedicamentoRepository';
import { Medicamento } from '../../entities/Medicamento';

export class ObtenerMedicamentoPorIdUseCase {
  constructor(private medicamentoRepository: IMedicamentoRepository) {}

  async execute(id: number): Promise<Medicamento | null> {
    return await this.medicamentoRepository.obtenerPorId(id);
  }
}