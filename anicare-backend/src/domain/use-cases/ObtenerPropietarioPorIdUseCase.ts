import { IPropietarioRepository } from '../interfaces/IPropietarioRepository';
import { Propietario } from '../entities/Propietario';

export class ObtenerPropietarioPorIdUseCase {
  constructor(private propietarioRepository: IPropietarioRepository) {}

  async execute(id: number): Promise<Propietario | null> {
    return await this.propietarioRepository.obtenerPorId(id);
  }
}
