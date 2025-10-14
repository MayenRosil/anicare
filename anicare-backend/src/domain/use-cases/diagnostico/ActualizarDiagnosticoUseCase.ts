import { IDiagnosticoConsultaRepository } from '../../interfaces/IDiagnosticoConsultaRepository';
import { DiagnosticoConsulta } from '../../entities/DiagnosticoConsulta';

export class ActualizarDiagnosticoUseCase {
  constructor(private diagnosticoRepository: IDiagnosticoConsultaRepository) {}

  async execute(id: number, data: Partial<DiagnosticoConsulta>): Promise<void> {
    await this.diagnosticoRepository.actualizar(id, data);
  }
}
