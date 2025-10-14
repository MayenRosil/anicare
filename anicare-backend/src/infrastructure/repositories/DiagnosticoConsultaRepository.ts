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
  const [rows]: any = await pool.query("SELECT * FROM DiagnosticoConsulta WHERE id = ?", [id]);
  return rows.length ? rows[0] : null;
}

// 👇 NUEVO
async obtenerPorConsulta(id_consulta: number): Promise<DiagnosticoConsulta[]> {
  const [rows]: any = await pool.query(
    "SELECT * FROM DiagnosticoConsulta WHERE id_consulta = ?",
    [id_consulta]
  );
  return rows;
}

async actualizar(id: number, data: Partial<DiagnosticoConsulta>): Promise<void> {
  const campos = [];
  const valores: any[] = [];

  const columnasValidas = ['id_consulta', 'id_diagnostico', 'tipo', 'estado', 'comentarios'];

  for (const [key, value] of Object.entries(data)) {
    if (!columnasValidas.includes(key)) continue; // 👈 ignora campos que no existen
    campos.push(`${key} = ?`);
    valores.push(value);
  }

  if (campos.length === 0) return;
  await pool.query(
    `UPDATE DiagnosticoConsulta SET ${campos.join(', ')} WHERE id = ?`,
    [...valores, id]
  );
}


}
