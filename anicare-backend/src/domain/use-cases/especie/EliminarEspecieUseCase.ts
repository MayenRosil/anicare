// anicare-backend/src/domain/use-cases/especie/EliminarEspecieUseCase.ts
import { IEspecieRepository } from '../../interfaces/IEspecieRepository';

export class EliminarEspecieUseCase {
  constructor(private repository: IEspecieRepository) {}

  async execute(id: number): Promise<void> {
    await this.repository.desactivar(id);
  }
}