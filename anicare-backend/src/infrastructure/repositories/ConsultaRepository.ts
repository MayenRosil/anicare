// src/infrastructure/repositories/ConsultaRepository.ts
import pool from '../../shared/config/db';
import { IConsultaRepository } from '../../domain/interfaces/IConsultaRepository';
import { Consulta } from '../../domain/entities/Consulta';

export class ConsultaRepository implements IConsultaRepository {
  async crear(data: Omit<Consulta, 'id'>): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO Consulta 
        (id_paciente, id_doctor, id_usuario_registro, id_cita, fecha_hora, estado, 
         motivo_consulta, peso, temperatura, frecuencia_cardiaca, frecuencia_respiratoria, notas_adicionales)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id_paciente,
        data.id_doctor,
        data.id_usuario_registro,
        data.id_cita,
        data.fecha_hora,
        data.estado,
        data.motivo_consulta || null,
        data.peso || null,
        data.temperatura || null,
        data.frecuencia_cardiaca || null,
        data.frecuencia_respiratoria || null,
        data.notas_adicionales || null
      ]
    );

    return result.insertId as number;
  }

  async obtenerPorId(id: number): Promise<Consulta | null> {
    const [rows]: any = await pool.query('SELECT * FROM Consulta WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rows[0];
  }

  // ✨ NUEVO: Obtener consulta completa con información del paciente y doctor
  async obtenerConsultaCompleta(id: number): Promise<any> {
    const [rows]: any = await pool.query(
      `SELECT 
        c.*,
        p.nombre AS paciente_nombre,
        p.sexo AS paciente_sexo,
        p.fecha_nacimiento AS paciente_fecha_nacimiento,
        p.color AS paciente_color,
        r.nombre AS raza_nombre,
        e.nombre AS especie_nombre,
        prop.nombre AS propietario_nombre,
        prop.apellido AS propietario_apellido,
        prop.telefono AS propietario_telefono,
        d.nombre AS doctor_nombre,
        d.apellido AS doctor_apellido,
        d.especialidad AS doctor_especialidad,
        cita.comentario AS cita_comentario
      FROM Consulta c
      INNER JOIN Paciente p ON p.id = c.id_paciente
      INNER JOIN Raza r ON r.id = p.id_raza
      INNER JOIN Especie e ON e.id = r.id_especie
      INNER JOIN Propietario prop ON prop.id = p.id_propietario
      INNER JOIN Doctor d ON d.id = c.id_doctor
      LEFT JOIN Cita cita ON cita.id = c.id_cita
      WHERE c.id = ?`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async obtenerTodas(): Promise<Consulta[]> {
    const [rows]: any = await pool.query('SELECT * FROM Consulta');
    return rows;
  }

  async actualizar(id: number, data: Partial<Consulta>): Promise<void> {
    const campos = [];
    const valores: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      campos.push(`${key} = ?`);
      valores.push(value);
    }

    if (campos.length === 0) return;
    await pool.query(`UPDATE Consulta SET ${campos.join(', ')} WHERE id = ?`, [...valores, id]);
  }

  // ✨ NUEVO: Finalizar consulta
  async finalizarConsulta(id: number): Promise<void> {
    await pool.query(
      `UPDATE Consulta SET estado = 'Finalizada' WHERE id = ?`,
      [id]
    );
  }

  async obtenerPorPaciente(idPaciente: number): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT 
        c.id,
        c.fecha_hora,
        c.estado,
        c.motivo_consulta,
        d.nombre AS doctor_nombre,
        d.apellido AS doctor_apellido,
        GROUP_CONCAT(DISTINCT diag.nombre SEPARATOR ', ') AS diagnosticos
      FROM Consulta c
      INNER JOIN Doctor d ON d.id = c.id_doctor
      LEFT JOIN DiagnosticoConsulta dc ON dc.id_consulta = c.id
      LEFT JOIN Diagnostico diag ON diag.id = dc.id_diagnostico
      WHERE c.id_paciente = ?
      GROUP BY c.id, c.fecha_hora, c.estado, c.motivo_consulta, d.nombre, d.apellido
      ORDER BY c.fecha_hora DESC`,
      [idPaciente]
    );
    return rows;
  }
}