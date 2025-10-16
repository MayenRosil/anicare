// anicare-backend/src/domain/use-cases/raza/EliminarRazaUseCase.ts
import { IRazaRepository } from '../../interfaces/IRazaRepository';

export class EliminarRazaUseCase {
  constructor(private repository: IRazaRepository) {}

  async execute(id: number): Promise<void> {
    await this.repository.desactivar(id);
  }
}