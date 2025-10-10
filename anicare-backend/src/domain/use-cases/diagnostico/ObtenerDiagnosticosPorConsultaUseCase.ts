import { IDiagnosticoConsultaRepository } from '../../interfaces/IDiagnosticoConsultaRepository';

export class ObtenerDiagnosticosPorConsultaUseCase {
  constructor(private diagnosticoRepository: IDiagnosticoConsultaRepository) {}

  async execute(idConsulta: number) {
    return this.diagnosticoRepository.obtenerPorConsulta(idConsulta);
  }
}
