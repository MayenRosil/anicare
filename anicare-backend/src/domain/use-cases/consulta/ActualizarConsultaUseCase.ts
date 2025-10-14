import { IConsultaRepository } from '../../interfaces/IConsultaRepository';
import { Consulta } from '../../entities/Consulta';

export class ActualizarConsultaUseCase {
  constructor(private consultaRepository: IConsultaRepository) {}

  async execute(id: number, data: Partial<Consulta>): Promise<void> {
    await this.consultaRepository.actualizar(id, data);
  }
}
