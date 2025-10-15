import { IMedicamentoRepository } from '../../interfaces/IMedicamentoRepository';
import { Medicamento } from '../../entities/Medicamento';

export class ObtenerTodosMedicamentosUseCase {
  constructor(private medicamentoRepository: IMedicamentoRepository) {}

  async execute(): Promise<Medicamento[]> {
    return await this.medicamentoRepository.obtenerTodos();
  }
}