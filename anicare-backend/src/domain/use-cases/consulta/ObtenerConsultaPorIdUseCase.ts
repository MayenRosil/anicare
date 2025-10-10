import { IConsultaRepository } from '../../interfaces/IConsultaRepository';

export class ObtenerConsultaPorIdUseCase {
  constructor(private consultaRepository: IConsultaRepository) {}

  async execute(id: number) {
    return this.consultaRepository.obtenerPorId(id);
  }
}
