// src/domain/interfaces/ICitaRepository.ts
import { Cita } from '../entities/Cita';

export interface ICitaRepository {
  crear(data: Omit<Cita, 'id' | 'estado'>): Promise<Cita>;
  obtenerTodos(): Promise<Cita[]>;
  obtenerPorId(id: number): Promise<Cita | null>;
  actualizarEstado(id: number, estado: 'Pendiente' | 'Atendida' | 'Cancelada'): Promise<void>;
}
