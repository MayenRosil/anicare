// src/domain/interfaces/ICitaRepository.ts
import { Cita } from '../entities/Cita';

export interface ICitaRepository {
  crear(data: Omit<Cita, 'id' | 'estado'>): Promise<Cita>;
  obtenerTodos(): Promise<Cita[]>;
  obtenerPorId(id: number): Promise<Cita | null>;
  actualizarEstado(id: number, estado: 'Pendiente' | 'Atendida' | 'Cancelada'): Promise<void>;
  
  // ✨ NUEVO: Obtener citas con información poblada de paciente y propietario
  obtenerTodasConDetalles(): Promise<any[]>;
  
  // ✨ NUEVO: Actualizar el paciente asignado a una cita
  actualizarPaciente(id: number, id_paciente: number): Promise<void>;
}