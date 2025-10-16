// anicare-backend/src/domain/use-cases/raza/ObtenerRazasPorEspecieUseCase.ts
import { IRazaRepository } from '../../interfaces/IRazaRepository';
import { Raza } from '../../entities/Raza';

export class ObtenerRazasPorEspecieUseCase {
  constructor(private repository: IRazaRepository) {}

  async execute(idEspecie: number): Promise<Raza[]> {
    return await this.repository.obtenerPorEspecie(idEspecie);
  }
}