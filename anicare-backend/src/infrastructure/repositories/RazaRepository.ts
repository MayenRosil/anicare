// src/infrastructure/repositories/RazaRepository.ts
import { IRazaRepository } from '../../domain/interfaces/IRazaRepository';
import { Raza } from '../../domain/entities/Raza';
import pool from '../../shared/config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class RazaRepository implements IRazaRepository {

  async obtenerTodos(): Promise<Raza[]> {
    const [rows]: any = await pool.query(`
      SELECT 
        r.*,
        e.nombre as nombre_especie
      FROM Raza r
      INNER JOIN Especie e ON e.id = r.id_especie
      ORDER BY r.nombre ASC
    `);
    return rows;
  }

  async crear(data: Omit<Raza, 'id'>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Raza (id_especie, nombre, descripcion, especie_personalizada) VALUES (?, ?, ?, ?)',
      [data.id_especie, data.nombre, data.descripcion, data.especie_personalizada || null]
    );
    return result.insertId;
  }

  async obtenerPorId(id: number): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, e.nombre as nombre_especie 
       FROM Raza r 
       INNER JOIN Especie e ON e.id = r.id_especie 
       WHERE r.id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async obtenerPorEspecie(idEspecie: number): Promise<Raza[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Raza WHERE id_especie = ? ORDER BY nombre ASC',
      [idEspecie]
    );
    return rows as Raza[];
  }

  // 🆕 Buscar o crear raza con especie personalizada
  async buscarOCrearRazaPersonalizada(
    nombreRaza: string,
    especiePersonalizada: string
  ): Promise<number> {
    // Primero buscar si ya existe
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM Raza WHERE nombre = ? AND id_especie = 3 LIMIT 1',
      [nombreRaza]
    );

    if (rows.length > 0) {
      return rows[0].id;
    }

    // Si no existe, crearla
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Raza (id_especie, nombre, descripcion, especie_personalizada) VALUES (3, ?, ?, ?)',
      [nombreRaza, `Raza personalizada: ${especiePersonalizada}`, especiePersonalizada]
    );
    
    return result.insertId;
  }

  async actualizar(id: number, data: Partial<Omit<Raza, 'id'>>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.id_especie !== undefined) {
      fields.push('id_especie = ?');
      values.push(data.id_especie);
    }
    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }
    if (data.especie_personalizada !== undefined) {
      fields.push('especie_personalizada = ?');
      values.push(data.especie_personalizada);
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.query(
      `UPDATE Raza SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async desactivar(id: number): Promise<void> {
    await pool.query('DELETE FROM Raza WHERE id = ?', [id]);
  }
}