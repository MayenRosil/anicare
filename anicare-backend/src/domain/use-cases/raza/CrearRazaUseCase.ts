// anicare-backend/src/domain/use-cases/raza/CrearRazaUseCase.ts
import { IRazaRepository } from '../../interfaces/IRazaRepository';
import { Raza } from '../../entities/Raza';

export class CrearRazaUseCase {
  constructor(private repository: IRazaRepository) {}

  async execute(data: Omit<Raza, 'id'>): Promise<number> {
    return await this.repository.crear(data);
  }
}