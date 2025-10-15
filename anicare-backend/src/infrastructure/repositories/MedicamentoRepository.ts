// src/infrastructure/repositories/MedicamentoRepository.ts
import pool from '../../shared/config/db';
import { IMedicamentoRepository } from '../../domain/interfaces/IMedicamentoRepository';
import { Medicamento } from '../../domain/entities/Medicamento';

export class MedicamentoRepository implements IMedicamentoRepository {
  async crear(data: Omit<Medicamento, 'id'>): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO Medicamento 
        (nombre, laboratorio, presentacion, unidad_medida, precio_compra, 
         precio_venta, ganancia_venta, stock_actual, stock_minimo, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        data.nombre,
        data.laboratorio,
        data.presentacion,
        data.unidad_medida,
        data.precio_compra,
        data.precio_venta,
        data.ganancia_venta,
        data.stock_actual,
        data.stock_minimo
      ]
    );
    return result.insertId as number;
  }

  async obtenerTodos(): Promise<Medicamento[]> {
    // Solo obtener medicamentos activos
    const [rows]: any = await pool.query(
      'SELECT * FROM Medicamento WHERE activo = TRUE ORDER BY nombre ASC'
    );
    return rows;
  }

  async obtenerPorId(id: number): Promise<Medicamento | null> {
    const [rows]: any = await pool.query(
      'SELECT * FROM Medicamento WHERE id = ? AND activo = TRUE', 
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  async actualizar(id: number, data: Partial<Medicamento>): Promise<void> {
    const campos = [];
    const valores: any[] = [];

    const columnasValidas = [
      'nombre', 'laboratorio', 'presentacion', 'unidad_medida',
      'precio_compra', 'precio_venta', 'ganancia_venta',
      'stock_actual', 'stock_minimo'
    ];

    for (const [key, value] of Object.entries(data)) {
      if (!columnasValidas.includes(key)) continue;
      campos.push(`${key} = ?`);
      valores.push(value);
    }

    if (campos.length === 0) return;

    await pool.query(
      `UPDATE Medicamento SET ${campos.join(', ')} WHERE id = ?`,
      [...valores, id]
    );
  }

  async eliminar(id: number): Promise<void> {
    // Eliminación LÓGICA - marca como inactivo en lugar de eliminar
    await pool.query('UPDATE Medicamento SET activo = FALSE WHERE id = ?', [id]);
  }
}