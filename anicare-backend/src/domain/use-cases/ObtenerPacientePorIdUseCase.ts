import { IPacienteRepository } from '../interfaces/IPacienteRepository';
import { Paciente } from '../entities/Paciente';

export class ObtenerPacientePorIdUseCase {
  constructor(private pacienteRepository: IPacienteRepository) {}

  async execute(id: number): Promise<Paciente | null> {
    return await this.pacienteRepository.obtenerPorId(id);
  }
}
