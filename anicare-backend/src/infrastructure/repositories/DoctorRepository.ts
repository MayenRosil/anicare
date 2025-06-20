// src/infrastructure/repositories/PropietarioRepository.ts
import { IDoctorRepository } from '../../domain/interfaces/IDoctorRepository';
import { Doctor } from '../../domain/entities/Doctor';
import pool from '../../shared/config/db';

export class DoctorRepository implements IDoctorRepository {

  async obtenerTodos(): Promise<Doctor[]> {
    const [rows]: any = await pool.query('SELECT * FROM Doctor');
    return rows.map((row: any) =>
      new Doctor(
        row.id,
        row.id_usuario,
        row.nombre,
        row.apellido,
        row.especialidad,
        row.dpi,
        row.telefono,
        row.correcto,
        row.activo
      )
    );
  }


}
