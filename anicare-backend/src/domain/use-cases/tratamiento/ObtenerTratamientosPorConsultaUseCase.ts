import { ITratamientoRepository } from '../../interfaces/ITratamientoRepository';
import { IDiagnosticoConsultaRepository } from '../../interfaces/IDiagnosticoConsultaRepository';

export class ObtenerTratamientosPorConsultaUseCase {
  constructor(
    private tratamientoRepository: ITratamientoRepository,
    private diagnosticoRepository: IDiagnosticoConsultaRepository
  ) {}

  async execute(idConsulta: number) {
    // Obtener todos los diagnósticos de esa consulta
    const diagnosticos = await this.diagnosticoRepository.obtenerPorConsulta(idConsulta);
    const tratamientos: any[] = [];

    for (const diag of diagnosticos) {
      const t = await this.tratamientoRepository.obtenerPorDiagnostico(diag.id!);
      tratamientos.push(...t);
    }

    return tratamientos;
  }
}
