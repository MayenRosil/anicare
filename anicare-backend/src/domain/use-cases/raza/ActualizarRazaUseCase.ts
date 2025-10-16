// anicare-backend/src/domain/use-cases/raza/ActualizarRazaUseCase.ts
import { IRazaRepository } from '../../interfaces/IRazaRepository';
import { Raza } from '../../entities/Raza';

export class ActualizarRazaUseCase {
  constructor(private repository: IRazaRepository) {}

  async execute(id: number, data: Partial<Omit<Raza, 'id'>>): Promise<void> {
    await this.repository.actualizar(id, data);
  }
}