// src/infrastructure/repositories/UsuarioRepository.ts
import { IUsuarioRepository } from '../../domain/interfaces/IUsuarioRepository';
import { Usuario } from '../../domain/entities/Usuario';
import pool from '../../shared/config/db';

export class UsuarioRepository implements IUsuarioRepository {
    async obtenerPorCorreo(correo: string): Promise<Usuario | null> {
        const [rows]: any = await pool.query('SELECT * FROM Usuario WHERE correo = ?', [correo]);
        const usuario = rows[0];
        if (!usuario) return null;

        return new Usuario(
            usuario.id,
            usuario.nombre_usuario,
            usuario.correo,
            usuario.contraseña,
            usuario.id_rol,
            usuario.activo,
            usuario.ultimo_login
        );

    }

    async actualizarUltimoLogin(id: number): Promise<void> {
        await pool.query('UPDATE Usuario SET ultimo_login = NOW() WHERE id = ?', [id]);
    }

}
