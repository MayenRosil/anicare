// src/infrastructure/repositories/CitaRepository.ts
import { ICitaRepository } from '../../domain/interfaces/ICitaRepository';
import { Cita } from '../../domain/entities/Cita';
import pool from '../../shared/config/db';

export class CitaRepository implements ICitaRepository {
  async crear(data: Omit<Cita, 'id' | 'estado'>): Promise<Cita> {
    const {
      id_paciente,
      id_doctor,
      id_usuario_registro,
      fecha_hora,
      comentario
    } = data;

    const [result]: any = await pool.query(
      `INSERT INTO Cita (id_paciente, id_doctor, id_usuario_registro, fecha_hora, estado, comentario)
       VALUES (?, ?, ?, ?, 'Pendiente', ?)`,
      [id_paciente, id_doctor, id_usuario_registro, fecha_hora, comentario]
    );

    return new Cita(
      result.insertId,
      id_paciente,
      id_doctor,
      id_usuario_registro,
      fecha_hora,
      'Pendiente',
      comentario
    );
  }

  async obtenerTodos(): Promise<Cita[]> {
    const [rows]: any = await pool.query('SELECT * FROM Cita');
    return rows.map((row: any) =>
      new Cita(
        row.id,
        row.id_paciente,
        row.id_doctor,
        row.id_usuario_registro,
        row.fecha_hora,
        row.estado,
        row.comentario
      )
    );
  }

  async obtenerPorId(id: number): Promise<Cita | null> {
    const [rows]: any = await pool.query('SELECT * FROM Cita WHERE id = ?', [id]);
    const row = rows[0];
    if (!row) return null;

    return new Cita(
      row.id,
      row.id_paciente,
      row.id_doctor,
      row.id_usuario_registro,
      row.fecha_hora,
      row.estado,
      row.comentario
    );
  }

  async actualizarEstado(id: number, estado: 'Pendiente' | 'Atendida' | 'Cancelada'): Promise<void> {
    await pool.query('UPDATE Cita SET estado = ? WHERE id = ?', [estado, id]);
  }
}
