// anicare-backend/src/domain/use-cases/especie/CrearEspecieUseCase.ts
import { IEspecieRepository } from '../../interfaces/IEspecieRepository';
import { Especie } from '../../entities/Especie';

export class CrearEspecieUseCase {
  constructor(private repository: IEspecieRepository) {}

  async execute(data: Omit<Especie, 'id'>): Promise<number> {
    return await this.repository.crear(data);
  }
}