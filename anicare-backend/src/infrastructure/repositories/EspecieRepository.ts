// anicare-backend/src/infrastructure/repositories/EspecieRepository.ts
import pool from '../../shared/config/db';
import { IEspecieRepository } from '../../domain/interfaces/IEspecieRepository';
import { Especie } from '../../domain/entities/Especie';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class EspecieRepository implements IEspecieRepository {
  async crear(data: Omit<Especie, 'id'>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Especie (nombre, descripcion) VALUES (?, ?)',
      [data.nombre, data.descripcion]
    );
    return result.insertId;
  }

  async obtenerTodos(): Promise<Especie[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Especie ORDER BY nombre ASC'
    );
    return rows as Especie[];
  }

  async obtenerPorId(id: number): Promise<Especie | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Especie WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Especie) : null;
  }

  async actualizar(id: number, data: Partial<Omit<Especie, 'id'>>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.query(
      `UPDATE Especie SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async desactivar(id: number): Promise<void> {
    await pool.query('DELETE FROM Especie WHERE id = ?', [id]);
  }
}