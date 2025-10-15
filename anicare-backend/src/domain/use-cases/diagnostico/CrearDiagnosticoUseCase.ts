// src/domain/use-cases/diagnostico/CrearDiagnosticoUseCase.ts
import { IDiagnosticoConsultaRepository } from '../../interfaces/IDiagnosticoConsultaRepository';
import { DiagnosticoConsulta } from '../../entities/DiagnosticoConsulta';

export class CrearDiagnosticoUseCase {
  constructor(private diagnosticoRepository: IDiagnosticoConsultaRepository) {}

  async execute(data: Omit<DiagnosticoConsulta, 'id'>): Promise<number> {
    return await this.diagnosticoRepository.crear(data);
  }
}