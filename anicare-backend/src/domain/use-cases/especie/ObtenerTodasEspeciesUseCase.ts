// anicare-backend/src/domain/use-cases/especie/ObtenerTodasEspeciesUseCase.ts
import { IEspecieRepository } from '../../interfaces/IEspecieRepository';
import { Especie } from '../../entities/Especie';

export class ObtenerTodasEspeciesUseCase {
  constructor(private repository: IEspecieRepository) {}

  async execute(): Promise<Especie[]> {
    return await this.repository.obtenerTodos();
  }
}