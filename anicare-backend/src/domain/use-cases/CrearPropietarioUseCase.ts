// src/domain/use-cases/CrearPropietarioUseCase.ts
import { IPropietarioRepository } from '../interfaces/IPropietarioRepository';
import { Propietario } from '../entities/Propietario';

export class CrearPropietarioUseCase {
  constructor(private propietarioRepository: IPropietarioRepository) {}

  async execute(data: Omit<Propietario, 'id'>): Promise<Propietario> {
    const nuevoPropietario = await this.propietarioRepository.crear(data);
    return nuevoPropietario;
  }
}
