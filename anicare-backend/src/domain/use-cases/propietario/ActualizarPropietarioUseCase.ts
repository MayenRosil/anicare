// src/domain/use-cases/propietario/ActualizarPropietarioUseCase.ts
import { IPropietarioRepository } from '../../interfaces/IPropietarioRepository';
import { Propietario } from '../../entities/Propietario';

export class ActualizarPropietarioUseCase {
  constructor(private repository: IPropietarioRepository) {}

  async execute(id: number, data: Partial<Propietario>): Promise<void> {
    await this.repository.actualizar!(id, data);
  }
}