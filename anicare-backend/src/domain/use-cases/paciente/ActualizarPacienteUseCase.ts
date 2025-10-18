import { IPacienteRepository } from '../../interfaces/IPacienteRepository';
import { Paciente } from '../../entities/Paciente';

export class ActualizarPacienteUseCase {
  constructor(private repository: IPacienteRepository) {}

  async execute(id: number, data: Partial<Paciente>): Promise<void> {
    await this.repository.actualizar(id, data);
  }
}