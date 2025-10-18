import { IPacienteRepository } from '../../interfaces/IPacienteRepository';

export class EliminarPacienteUseCase {
  constructor(private repository: IPacienteRepository) {}

  async execute(id: number): Promise<void> {
    await this.repository.eliminar(id);
  }
}