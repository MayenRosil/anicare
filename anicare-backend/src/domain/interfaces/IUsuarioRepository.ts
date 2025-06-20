// src/domain/interfaces/IUsuarioRepository.ts
import { Usuario } from '../entities/Usuario';

export interface IUsuarioRepository {
    obtenerPorCorreo(correo: string): Promise<Usuario | null>;
    actualizarUltimoLogin(id: number): Promise<void>;
    desactivar?(id: number): Promise<void>;
}
