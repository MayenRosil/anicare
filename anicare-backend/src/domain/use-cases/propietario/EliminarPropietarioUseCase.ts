// src/domain/use-cases/propietario/EliminarPropietarioUseCase.ts
import { IPropietarioRepository } from '../../interfaces/IPropietarioRepository';

export class EliminarPropietarioUseCase {
  constructor(private repository: IPropietarioRepository) {}

  async execute(id: number): Promise<void> {
    await this.repository.eliminar!(id);
  }
}