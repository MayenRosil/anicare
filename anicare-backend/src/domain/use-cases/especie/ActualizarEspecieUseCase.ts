// anicare-backend/src/domain/use-cases/especie/ActualizarEspecieUseCase.ts
import { IEspecieRepository } from '../../interfaces/IEspecieRepository';
import { Especie } from '../../entities/Especie';

export class ActualizarEspecieUseCase {
  constructor(private repository: IEspecieRepository) {}

  async execute(id: number, data: Partial<Omit<Especie, 'id'>>): Promise<void> {
    await this.repository.actualizar(id, data);
  }
}