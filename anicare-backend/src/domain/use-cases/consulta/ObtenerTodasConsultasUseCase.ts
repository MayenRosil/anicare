// src/domain/use-cases/consulta/ObtenerTodasConsultasUseCase.ts
import { IConsultaRepository } from '../../interfaces/IConsultaRepository';
import { Consulta } from '../../entities/Consulta';

export class ObtenerTodasConsultasUseCase {
  constructor(private consultaRepository: IConsultaRepository) {}

  async execute(): Promise<Consulta[]> {
    return await this.consultaRepository.obtenerTodas();
  }
}