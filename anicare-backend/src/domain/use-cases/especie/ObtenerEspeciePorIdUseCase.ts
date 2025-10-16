// anicare-backend/src/domain/use-cases/especie/ObtenerEspeciePorIdUseCase.ts
import { IEspecieRepository } from '../../interfaces/IEspecieRepository';
import { Especie } from '../../entities/Especie';

export class ObtenerEspeciePorIdUseCase {
  constructor(private repository: IEspecieRepository) {}

  async execute(id: number): Promise<Especie | null> {
    return await this.repository.obtenerPorId(id);
  }
}