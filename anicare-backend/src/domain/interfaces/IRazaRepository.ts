// src/domain/interfaces/ICitaRepository.ts
import { Raza } from '../entities/Raza';

export interface IRazaRepository {
  obtenerTodos(): Promise<Raza[]>;
}
