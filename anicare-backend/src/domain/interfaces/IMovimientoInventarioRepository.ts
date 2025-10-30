// anicare-backend/src/domain/interfaces/IMovimientoInventarioRepository.ts
import { MovimientoInventario } from '../entities/MovimientoInventario';

export interface IMovimientoInventarioRepository {
  crear(data: Omit<MovimientoInventario, 'id'>): Promise<number>;
  obtenerPorMedicamento(id_medicamento: number): Promise<MovimientoInventario[]>;
  obtenerTodos(): Promise<MovimientoInventario[]>;
}