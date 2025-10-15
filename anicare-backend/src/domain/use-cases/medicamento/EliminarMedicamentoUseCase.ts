// src/domain/use-cases/medicamento/EliminarMedicamentoUseCase.ts
import { IMedicamentoRepository } from '../../interfaces/IMedicamentoRepository';

export class EliminarMedicamentoUseCase {
  constructor(private medicamentoRepository: IMedicamentoRepository) {}

  async execute(id: number): Promise<void> {
    await this.medicamentoRepository.eliminar(id);
  }
}