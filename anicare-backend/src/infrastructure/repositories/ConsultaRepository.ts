import  pool  from '../../shared/config/db';
import { IConsultaRepository } from '../../domain/interfaces/IConsultaRepository';
import { Consulta } from '../../domain/entities/Consulta';

export class ConsultaRepository implements IConsultaRepository {
  async crear(data: Omit<Consulta, 'id'>): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO Consulta 
        (id_paciente, id_doctor, id_usuario_registro, id_cita, fecha_hora, estado, notas_adicionales)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id_paciente,
        data.id_doctor,
        data.id_usuario_registro,
        data.id_cita,
        data.fecha_hora,
        data.estado,
        data.notas_adicionales
      ]
    );

    return result.insertId as number;
  }

  async obtenerPorId(id: number): Promise<Consulta | null> {
    const [rows]: any = await pool.query('SELECT * FROM Consulta WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rows[0];
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

}
