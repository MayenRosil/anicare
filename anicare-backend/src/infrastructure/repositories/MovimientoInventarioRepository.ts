// anicare-backend/src/infrastructure/repositories/MovimientoInventarioRepository.ts
import pool from '../../shared/config/db';
import { IMovimientoInventarioRepository } from '../../domain/interfaces/IMovimientoInventarioRepository';
import { MovimientoInventario } from '../../domain/entities/MovimientoInventario';

export class MovimientoInventarioRepository implements IMovimientoInventarioRepository {
  async crear(data: Omit<MovimientoInventario, 'id'>): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO MovimientosInventario 
        (id_medicamento, tipo_movimiento, cantidad, fecha_movimiento, observaciones, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.id_medicamento,
        data.tipo_movimiento,
        data.cantidad,
        data.fecha_movimiento,
        data.observaciones,
        data.id_usuario
      ]
    );

    return result.insertId as number;
  }

  async obtenerPorMedicamento(id_medicamento: number): Promise<MovimientoInventario[]> {
    const [rows]: any = await pool.query(
      `SELECT * FROM MovimientosInventario 
       WHERE id_medicamento = ? 
       ORDER BY fecha_movimiento DESC`,
      [id_medicamento]
    );
    return rows;
  }

  async obtenerTodos(): Promise<MovimientoInventario[]> {
    const [rows]: any = await pool.query(
      `SELECT mi.*, m.nombre as nombre_medicamento 
       FROM MovimientosInventario mi
       INNER JOIN Medicamento m ON mi.id_medicamento = m.id
       ORDER BY mi.fecha_movimiento DESC`
    );
    return rows;
  }
}