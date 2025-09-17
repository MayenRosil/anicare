import { IPropietarioRepository } from '../../interfaces/IPropietarioRepository';
import { Propietario } from '../../entities/Propietario';

export class ObtenerTodosPropietariosUseCase {
  constructor(private propietarioRepository: IPropietarioRepository) {}

  async execute(): Promise<Propietario[]> {
    return await this.propietarioRepository.obtenerTodos();
  }
}
