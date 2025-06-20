import { IPacienteRepository } from '../interfaces/IPacienteRepository';
import { Paciente } from '../entities/Paciente';

export class ObtenerTodosPacientesUseCase {
  constructor(private pacienteRepository: IPacienteRepository) {}

  async execute(): Promise<Paciente[]> {
    return await this.pacienteRepository.obtenerTodos();
  }
}
