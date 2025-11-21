// src/domain/use-cases/raza/BuscarOCrearRazaPersonalizadaUseCase.ts
import { IRazaRepository } from '../../interfaces/IRazaRepository';

export class BuscarOCrearRazaPersonalizadaUseCase {
  constructor(private repository: IRazaRepository) {}

  async execute(nombreRaza: string, especiePersonalizada: string): Promise<number> {
    return await this.repository.buscarOCrearRazaPersonalizada(nombreRaza, especiePersonalizada);
  }
}