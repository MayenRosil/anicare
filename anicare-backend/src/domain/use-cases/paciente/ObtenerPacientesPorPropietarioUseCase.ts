import { IPacienteRepository } from '../../interfaces/IPacienteRepository';
import { Paciente } from '../../entities/Paciente';

export class ObtenerPacientesPorPropietarioUseCase {
  constructor(private pacienteRepository: IPacienteRepository) {}

  async execute(id_propietario: number): Promise<Paciente[]> {
    return await this.pacienteRepository.obtenerPorPropietario(id_propietario);
  }
}
