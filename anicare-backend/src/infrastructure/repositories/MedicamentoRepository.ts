// anicare-backend/src/infrastructure/repositories/MedicamentoRepository.ts
import pool from '../../shared/config/db';
import { IMedicamentoRepository } from '../../domain/interfaces/IMedicamentoRepository';
import { Medicamento } from '../../domain/entities/Medicamento';

export class MedicamentoRepository implements IMedicamentoRepository {
  async crear(data: Omit<Medicamento, 'id'>): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO Medicamento 
        (nombre, laboratorio, presentacion, unidad_medida, precio_compra, 
         precio_venta, ganancia_venta, stock_actual, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        data.nombre,
        data.laboratorio,
        data.presentacion,
        data.unidad_medida,
        data.precio_compra,
        data.precio_venta,
        data.ganancia_venta,
        data.stock_actual
      ]
    );
    return result.insertId as number;
  }

  async obtenerTodos(): Promise<Medicamento[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM Medicamento WHERE activo = TRUE ORDER BY nombre ASC'
    );
    
    // Convertir strings a números
    return rows.map((med: any) => ({
      ...med,
      precio_compra: med.precio_compra ? parseFloat(med.precio_compra) : null,
      precio_venta: med.precio_venta ? parseFloat(med.precio_venta) : null,
      ganancia_venta: med.ganancia_venta ? parseFloat(med.ganancia_venta) : null,
      stock_actual: parseInt(med.stock_actual) || 0
    }));
  }

  async obtenerPorId(id: number): Promise<Medicamento | null> {
    const [rows]: any = await pool.query(
      'SELECT * FROM Medicamento WHERE id = ? AND activo = TRUE', 
      [id]
    );
    
    if (rows.length === 0) return null;
    
    const med = rows[0];
    return {
      ...med,
      precio_compra: med.precio_compra ? parseFloat(med.precio_compra) : null,
      precio_venta: med.precio_venta ? parseFloat(med.precio_venta) : null,
      ganancia_venta: med.ganancia_venta ? parseFloat(med.ganancia_venta) : null,
      stock_actual: parseInt(med.stock_actual) || 0
    };
  }

  async actualizar(id: number, data: Partial<Medicamento>): Promise<void> {
    const campos = [];
    const valores: any[] = [];

    const columnasValidas = [
      'nombre', 'laboratorio', 'presentacion', 'unidad_medida',
      'precio_compra', 'precio_venta', 'ganancia_venta', 'stock_actual'
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

  async actualizarStock(id: number, nuevoStock: number): Promise<void> {
    await pool.query(
      'UPDATE Medicamento SET stock_actual = ? WHERE id = ?',
      [nuevoStock, id]
    );
  }

  async eliminar(id: number): Promise<void> {
    // Eliminación LÓGICA
    await pool.query('UPDATE Medicamento SET activo = FALSE WHERE id = ?', [id]);
  }
}