// src/infrastructure/repositories/PacienteRepository.ts
import { IPacienteRepository } from '../../domain/interfaces/IPacienteRepository';
import { Paciente } from '../../domain/entities/Paciente';
import pool from '../../shared/config/db';

export class PacienteRepository implements IPacienteRepository {
  async crear(data: Omit<Paciente, 'id'>): Promise<Paciente> {
    const {
      id_propietario,
      id_raza,
      nombre,
      sexo,
      fecha_nacimiento,
      color,
      castrado = false,
      adoptado = false,
      fecha_adopcion = null,
      edad_aproximada = false
    } = data;

    const [result]: any = await pool.query(
      `INSERT INTO Paciente (
        id_propietario, id_raza, nombre, sexo, fecha_nacimiento, color,
        castrado, adoptado, fecha_adopcion, edad_aproximada
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_propietario, id_raza, nombre, sexo, fecha_nacimiento, color,
        castrado, adoptado, fecha_adopcion, edad_aproximada
      ]
    );

    return new Paciente(
      result.insertId,
      id_propietario,
      id_raza,
      nombre,
      sexo,
      fecha_nacimiento,
      color,
      castrado,
      adoptado,
      fecha_adopcion,
      edad_aproximada
    );
  }

  async obtenerTodos(): Promise<Paciente[]> {
    const [rows]: any = await pool.query(`
      SELECT 
        p.*,
        CONCAT(prop.nombre, ' ', prop.apellido) as nombre_propietario,
        r.nombre as nombre_raza,
        e.nombre as nombre_especie
      FROM Paciente p
      LEFT JOIN Propietario prop ON p.id_propietario = prop.id
      LEFT JOIN Raza r ON p.id_raza = r.id
      LEFT JOIN Especie e ON r.id_especie = e.id
    `);
    return rows;
  }

  async obtenerPorId(id: number): Promise<Paciente | null> {
    const [rows]: any = await pool.query(`
      SELECT 
        p.*,
        CONCAT(prop.nombre, ' ', prop.apellido) as nombre_propietario,
        r.nombre as nombre_raza,
        e.nombre as nombre_especie
      FROM Paciente p
      LEFT JOIN Propietario prop ON p.id_propietario = prop.id
      LEFT JOIN Raza r ON p.id_raza = r.id
      LEFT JOIN Especie e ON r.id_especie = e.id
      WHERE p.id = ?
    `, [id]);
    
    const row = rows[0];
    if (!row) return null;

    return new Paciente(
      row.id,
      row.id_propietario,
      row.id_raza,
      row.nombre,
      row.sexo,
      row.fecha_nacimiento,
      row.color,
      row.castrado,
      row.adoptado,
      row.fecha_adopcion,
      row.edad_aproximada,
      row.nombre_propietario,
      row.nombre_raza,
      row.nombre_especie
    );
  }

  async obtenerPorPropietario(id_propietario: number): Promise<Paciente[]> {
    const [rows]: any = await pool.query(`
      SELECT 
        p.*,
        r.nombre as nombre_raza,
        e.nombre as nombre_especie
      FROM Paciente p
      LEFT JOIN Raza r ON p.id_raza = r.id
      LEFT JOIN Especie e ON r.id_especie = e.id
      WHERE p.id_propietario = ?
    `, [id_propietario]);
    
    return rows.map((row: any) =>
      new Paciente(
        row.id,
        row.id_propietario,
        row.id_raza,
        row.nombre,
        row.sexo,
        row.fecha_nacimiento,
        row.color,
        row.castrado,
        row.adoptado,
        row.fecha_adopcion,
        row.edad_aproximada,
        undefined,
        row.nombre_raza,
        row.nombre_especie
      )
    );
  }

  // 🆕 Actualizar - INCLUYE NUEVOS CAMPOS
  async actualizar(id: number, data: Partial<Paciente>): Promise<void> {
    const campos = [];
    const valores: any[] = [];

    if (data.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(data.nombre);
    }
    if (data.sexo !== undefined) {
      campos.push('sexo = ?');
      valores.push(data.sexo);
    }
    if (data.color !== undefined) {
      campos.push('color = ?');
      valores.push(data.color);
    }
    if (data.fecha_nacimiento !== undefined) {
      campos.push('fecha_nacimiento = ?');
      valores.push(data.fecha_nacimiento);
    }
    if (data.id_raza !== undefined) {
      campos.push('id_raza = ?');
      valores.push(data.id_raza);
    }
    if (data.id_propietario !== undefined) {
      campos.push('id_propietario = ?');
      valores.push(data.id_propietario);
    }
    // 🆕 NUEVOS CAMPOS
    if (data.castrado !== undefined) {
      campos.push('castrado = ?');
      valores.push(data.castrado);
    }
    if (data.adoptado !== undefined) {
      campos.push('adoptado = ?');
      valores.push(data.adoptado);
    }
    if (data.fecha_adopcion !== undefined) {
      campos.push('fecha_adopcion = ?');
      valores.push(data.fecha_adopcion);
    }
    if (data.edad_aproximada !== undefined) {
      campos.push('edad_aproximada = ?');
      valores.push(data.edad_aproximada);
    }

    if (campos.length === 0) return;

    valores.push(id);
    await pool.query(
      `UPDATE Paciente SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
  }

  // 🆕 Eliminar
  async eliminar(id: number): Promise<void> {
    await pool.query('DELETE FROM Paciente WHERE id = ?', [id]);
  }
}