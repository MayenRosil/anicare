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

async obtenerPorId(id: number): Promise<Tratamiento | null> {
  const [rows]: any = await pool.query("SELECT * FROM Tratamiento WHERE id = ?", [id]);
  return rows.length ? rows[0] : null;
}

// 👇 NUEVO
async obtenerPorDiagnostico(id_diagnostico_consulta: number): Promise<Tratamiento[]> {
  const [rows]: any = await pool.query(
    "SELECT * FROM Tratamiento WHERE id_diagnostico_consulta = ?",
    [id_diagnostico_consulta]
  );
  return rows;
}

async actualizar(id: number, data: Partial<Tratamiento>): Promise<void> {
  const campos = [];
  const valores: any[] = [];

  // Solo las columnas que realmente existen en la tabla Tratamiento
  const columnasValidas = [
    'id_diagnostico_consulta',
    'id_medicamento',
    'dosis',
    'frecuencia',
    'duracion',
    'instrucciones'
  ];

  for (const [key, value] of Object.entries(data)) {
    if (!columnasValidas.includes(key)) continue; // 👈 ignora "nombre" u otros
    campos.push(`${key} = ?`);
    valores.push(value);
  }

  if (campos.length === 0) return; // nada que actualizar
  await pool.query(
    `UPDATE Tratamiento SET ${campos.join(', ')} WHERE id = ?`,
    [...valores, id]
  );
}



}
