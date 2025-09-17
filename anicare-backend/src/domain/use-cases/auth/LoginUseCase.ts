// src/domain/use-cases/LoginUseCase.ts
import { IUsuarioRepository } from '../../interfaces/IUsuarioRepository';
import bcrypt from 'bcryptjs';
import { Usuario } from '../../entities/Usuario';

export class LoginUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(correo: string, contraseña: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.obtenerPorCorreo(correo);
    if (!usuario || !usuario.activo) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    const passwordValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!passwordValida) {
      throw new Error('Credenciales inválidas');
    }

    await this.usuarioRepository.actualizarUltimoLogin(usuario.id);

    return usuario;
  }
}
