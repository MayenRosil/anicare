import { IRazaRepository } from '../../interfaces/IRazaRepository';
import { Raza } from '../../entities/Raza';

export class ObtenerTodasRazasUseCase {
  constructor(private razaRepository: IRazaRepository) {}

  async execute(): Promise<Raza[]> {
    return await this.razaRepository.obtenerTodos();
  }
}
