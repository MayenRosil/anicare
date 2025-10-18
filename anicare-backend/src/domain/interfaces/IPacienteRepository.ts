// src/domain/interfaces/IPacienteRepository.ts
import { Paciente } from '../entities/Paciente';

export interface IPacienteRepository {
    crear(data: Omit<Paciente, 'id'>): Promise<Paciente>;
    obtenerTodos(): Promise<Paciente[]>;
    obtenerPorId(id: number): Promise<Paciente | null>;
    obtenerPorPropietario(id_propietario: number): Promise<Paciente[]>;
    desactivar?(id: number): Promise<void>;
      actualizar(id: number, data: Partial<Paciente>): Promise<void>; // 🆕
  eliminar(id: number): Promise<void>; // 🆕

}
