
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
      color
    } = data;

    const [result]: any = await pool.query(
      `INSERT INTO Paciente (id_propietario, id_raza, nombre, sexo, fecha_nacimiento, color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_propietario, id_raza, nombre, sexo, fecha_nacimiento, color]
    );

    return new Paciente(
      result.insertId,
      id_propietario,
      id_raza,
      nombre,
      sexo,
      fecha_nacimiento,
      color
    );
  }

  async obtenerTodos(): Promise<Paciente[]> {
    const [rows]: any = await pool.query('SELECT * FROM Paciente');
    return rows.map((row: any) =>
      new Paciente(
        row.id,
        row.id_propietario,
        row.id_raza,
        row.nombre,
        row.sexo,
        row.fecha_nacimiento,
        row.color
      )
    );
  }

  async obtenerPorId(id: number): Promise<Paciente | null> {
    const [rows]: any = await pool.query('SELECT * FROM Paciente WHERE id = ?', [id]);
    const row = rows[0];
    if (!row) return null;

    return new Paciente(
      row.id,
      row.id_propietario,
      row.id_raza,
      row.nombre,
      row.sexo,
      row.fecha_nacimiento,
      row.color
    );
  }

  async obtenerPorPropietario(id_propietario: number): Promise<Paciente[]> {
    const [rows]: any = await pool.query('SELECT * FROM Paciente WHERE id_propietario = ?', [id_propietario]);
    return rows.map((row: any) =>
      new Paciente(
        row.id,
        row.id_propietario,
        row.id_raza,
        row.nombre,
        row.sexo,
        row.fecha_nacimiento,
        row.color
      )
    );
  }
}
