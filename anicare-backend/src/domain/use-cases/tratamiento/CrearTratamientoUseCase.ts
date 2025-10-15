// src/domain/use-cases/tratamiento/CrearTratamientoUseCase.ts
import { ITratamientoRepository } from '../../interfaces/ITratamientoRepository';
import { Tratamiento } from '../../entities/Tratamiento';

export class CrearTratamientoUseCase {
  constructor(private tratamientoRepository: ITratamientoRepository) {}

  async execute(data: Omit<Tratamiento, 'id'>): Promise<number> {
    return await this.tratamientoRepository.crear(data);
  }
}