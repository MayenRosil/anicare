import  pool  from '../../shared/config/db';
import { IDiagnosticoConsultaRepository } from '../../domain/interfaces/IDiagnosticoConsultaRepository';
import { DiagnosticoConsulta } from '../../domain/entities/DiagnosticoConsulta';

export class DiagnosticoConsultaRepository implements IDiagnosticoConsultaRepository {
  async crear(data: Omit<DiagnosticoConsulta, 'id'>): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO DiagnosticoConsulta 
        (id_consulta, id_diagnostico, tipo, estado, comentarios)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.id_consulta,
        data.id_diagnostico,
        data.tipo,
        data.estado,
        data.comentarios
      ]
    );

    return result.insertId as number;
  }

  async obtenerPorId(id: number): Promise<DiagnosticoConsulta | null> {
    const [rows]: any = await pool.query('SELECT * FROM DiagnosticoConsulta WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rows[0];
  }

  async obtenerPorConsulta(id_consulta: number): Promise<DiagnosticoConsulta[]> {
    const [rows]: any = await pool.query('SELECT * FROM DiagnosticoConsulta WHERE id_consulta = ?', [id_consulta]);
    return rows;
  }
}
