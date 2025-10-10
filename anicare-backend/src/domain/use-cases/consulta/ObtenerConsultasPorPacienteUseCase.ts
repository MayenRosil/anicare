import { IConsultaRepository } from '../../interfaces/IConsultaRepository';

export class ObtenerConsultasPorPacienteUseCase {
  constructor(private consultaRepository: IConsultaRepository) {}

  async execute(idPaciente: number) {
    return this.consultaRepository.obtenerPorPaciente(idPaciente);
  }
}
