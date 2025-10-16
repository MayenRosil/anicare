// anicare-backend/src/domain/interfaces/IEspecieRepository.ts
import { Especie } from '../entities/Especie';

export interface IEspecieRepository {
  crear(data: Omit<Especie, 'id'>): Promise<number>;
  obtenerTodos(): Promise<Especie[]>;
  obtenerPorId(id: number): Promise<Especie | null>;
  actualizar(id: number, data: Partial<Omit<Especie, 'id'>>): Promise<void>;
  desactivar(id: number): Promise<void>;
}