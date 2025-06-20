// src/infrastructure/repositories/PropietarioRepository.ts
import { IPropietarioRepository } from '../../domain/interfaces/IPropietarioRepository';
import { Propietario } from '../../domain/entities/Propietario';
import pool from '../../shared/config/db';

export class PropietarioRepository implements IPropietarioRepository {
  async crear(data: Omit<Propietario, 'id'>): Promise<Propietario> {
    const {
      nombre,
      apellido,
      dpi,
      nit,
      direccion,
      telefono,
      correo
    } = data;

    const [result]: any = await pool.query(
      `INSERT INTO Propietario (nombre, apellido, dpi, nit, direccion, telefono, correo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, dpi, nit, direccion, telefono, correo]
    );

    return new Propietario(
      result.insertId,
      nombre,
      apellido,
      dpi,
      nit,
      direccion,
      telefono,
      correo
    );
  }

  async obtenerTodos(): Promise<Propietario[]> {
    const [rows]: any = await pool.query('SELECT * FROM Propietario');
    return rows.map((row: any) =>
      new Propietario(
        row.id,
        row.nombre,
        row.apellido,
        row.dpi,
        row.nit,
        row.direccion,
        row.telefono,
        row.correo
      )
    );
  }

  async obtenerPorId(id: number): Promise<Propietario | null> {
    const [rows]: any = await pool.query('SELECT * FROM Propietario WHERE id = ?', [id]);
    const row = rows[0];
    if (!row) return null;

    return new Propietario(
      row.id,
      row.nombre,
      row.apellido,
      row.dpi,
      row.nit,
      row.direccion,
      row.telefono,
      row.correo
    );
  }
}
