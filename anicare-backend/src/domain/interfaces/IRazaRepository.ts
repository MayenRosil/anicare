// anicare-backend/src/domain/interfaces/IRazaRepository.ts
import { Raza } from '../entities/Raza';

export interface IRazaRepository {
  crear(data: Omit<Raza, 'id'>): Promise<number>;
  obtenerTodos(): Promise<any[]>; // Retorna razas con nombre de especie
  obtenerPorId(id: number): Promise<any | null>;
  obtenerPorEspecie(idEspecie: number): Promise<Raza[]>;
  actualizar(id: number, data: Partial<Omit<Raza, 'id'>>): Promise<void>;
  desactivar(id: number): Promise<void>;
}