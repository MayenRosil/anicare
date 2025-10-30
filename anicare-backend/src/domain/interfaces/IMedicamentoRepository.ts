// anicare-backend/src/domain/interfaces/IMedicamentoRepository.ts
import { Medicamento } from '../entities/Medicamento';

export interface IMedicamentoRepository {
  crear(data: Omit<Medicamento, 'id'>): Promise<number>;
  obtenerTodos(): Promise<Medicamento[]>;
  obtenerPorId(id: number): Promise<Medicamento | null>;
  actualizar(id: number, data: Partial<Medicamento>): Promise<void>;
  actualizarStock(id: number, nuevoStock: number): Promise<void>; // ✨ NUEVO MÉTODO
  eliminar(id: number): Promise<void>;
}