import { IPacienteRepository } from '../../interfaces/IPacienteRepository';
import { Paciente } from '../../entities/Paciente';

export class CrearPacienteUseCase {
  constructor(private pacienteRepository: IPacienteRepository) {}

  async execute(data: Omit<Paciente, 'id'>): Promise<Paciente> {
    return await this.pacienteRepository.crear(data);
  }
}
