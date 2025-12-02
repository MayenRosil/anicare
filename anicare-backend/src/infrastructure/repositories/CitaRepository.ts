// src/infrastructure/repositories/CitaRepository.ts
import { ICitaRepository } from '../../domain/interfaces/ICitaRepository';
import { Cita } from '../../domain/entities/Cita';
import pool from '../../shared/config/db';
import {localStringToDatePreservingTime, toMySQLDateTime} from '../../shared/utils/convertirFechas';

export class CitaRepository implements ICitaRepository {
  async crear(data: Omit<Cita, 'id' | 'estado'>): Promise<Cita> {
    const {
      id_paciente,
      id_doctor,
      id_usuario_registro,
      fecha_hora,
      es_grooming, // ✨ AGREGAR
      comentario
    } = data;

    const [result]: any = await pool.query(
      `INSERT INTO Cita (id_paciente, id_doctor, id_usuario_registro, fecha_hora, estado, es_grooming, comentario)
       VALUES (?, ?, ?, ?, 'Pendiente', ?, ?)`, // ✨ AGREGAR es_grooming
      [id_paciente, id_doctor, id_usuario_registro, toMySQLDateTime(fecha_hora.toString()), es_grooming, comentario] // ✨ AGREGAR es_grooming
    );
    
    return new Cita(
      result.insertId,
      id_paciente,
      id_doctor,
      id_usuario_registro,
      fecha_hora,
      'Pendiente',
      es_grooming, // ✨ AGREGAR
      comentario
    );
  }

  async obtenerTodos(): Promise<Cita[]> {
    const [rows]: any = await pool.query('SELECT * FROM Cita');
    return rows.map((row: any) =>
      new Cita(
        row.id,
        row.id_paciente, // Puede ser NULL
        row.id_doctor,
        row.id_usuario_registro,
        localStringToDatePreservingTime(row.fecha_hora),
        row.estado,
        row.es_grooming, // ✨ AGREGAR
        row.comentario
      )
    );
  }

  // ✨ NUEVO: Obtener todas las citas con detalles del paciente y propietario
  async obtenerTodasConDetalles(): Promise<any[]> {
    const [rows]: any = await pool.query(`
      SELECT 
        c.*,
        CASE 
          WHEN c.id_paciente IS NULL THEN 'PACIENTE NUEVO'
          ELSE p.nombre
        END AS paciente_nombre,
        CASE 
          WHEN c.id_paciente IS NULL THEN NULL
          ELSE CONCAT(prop.nombre, ' ', prop.apellido)
        END AS propietario_nombre,
        d.nombre AS doctor_nombre,
        d.apellido AS doctor_apellido
      FROM Cita c
      LEFT JOIN Paciente p ON p.id = c.id_paciente
      LEFT JOIN Propietario prop ON prop.id = p.id_propietario
      INNER JOIN Doctor d ON d.id = c.id_doctor
      ORDER BY c.fecha_hora DESC
    `);
    
    return rows.map((row: any) => ({
      ...row, // ✨ El c.* ya incluye es_grooming, no hace falta agregarlo explícitamente
      fecha_hora: localStringToDatePreservingTime(row.fecha_hora),
      esPacienteNuevo: row.id_paciente === null
    }));
  }

  async obtenerPorId(id: number): Promise<Cita | null> {
    const [rows]: any = await pool.query('SELECT * FROM Cita WHERE id = ?', [id]);
    const row = rows[0];
    if (!row) return null;

    return new Cita(
      row.id,
      row.id_paciente, // Puede ser NULL
      row.id_doctor,
      row.id_usuario_registro,
      localStringToDatePreservingTime(row.fecha_hora),
      row.estado,
      row.es_grooming, // ✨ AGREGAR
      row.comentario
    );
  }

  async actualizarEstado(id: number, estado: 'Pendiente' | 'Atendida' | 'Cancelada'): Promise<void> {
    await pool.query('UPDATE Cita SET estado = ? WHERE id = ?', [estado, id]);
  }

  // ✨ NUEVO: Actualizar el paciente de una cita
  async actualizarPaciente(id: number, id_paciente: number): Promise<void> {
    await pool.query('UPDATE Cita SET id_paciente = ? WHERE id = ?', [id_paciente, id]);
  }
}