// anicare-backend/src/domain/use-cases/raza/ObtenerRazaPorIdUseCase.ts
import { IRazaRepository } from '../../interfaces/IRazaRepository';

export class ObtenerRazaPorIdUseCase {
  constructor(private repository: IRazaRepository) {}

  async execute(id: number): Promise<any | null> {
    return await this.repository.obtenerPorId(id);
  }
}