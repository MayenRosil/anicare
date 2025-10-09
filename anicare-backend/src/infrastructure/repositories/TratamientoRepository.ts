import  pool  from '../../shared/config/db';
import { ITratamientoRepository } from '../../domain/interfaces/ITratamientoRepository';
import { Tratamiento } from '../../domain/entities/Tratamiento';

export class TratamientoRepository implements ITratamientoRepository {
  async crear(data: Omit<Tratamiento, 'id'>): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO Tratamiento 
        (id_diagnostico_consulta, id_medicamento, dosis, frecuencia, duracion, instrucciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.id_diagnostico_consulta,
        data.id_medicamento,
        data.dosis,
        data.frecuencia,
        data.duracion,
        data.instrucciones
      ]
    );

    return result.insertId as number;
  }

  async obtenerPorDiagnostico(id_diagnostico_consulta: number): Promise<Tratamiento[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM Tratamiento WHERE id_diagnostico_consulta = ?',
      [id_diagnostico_consulta]
    );
    return rows;
  }

  async obtenerPorId(id: number): Promise<Tratamiento | null> {
    const [rows]: any = await pool.query('SELECT * FROM Tratamiento WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rows[0];
  }
}
