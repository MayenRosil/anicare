// src/domain/interfaces/IPropietarioRepository.ts
import { Propietario } from '../entities/Propietario';

export interface IPropietarioRepository {
    crear(propietario: Omit<Propietario, 'id'>): Promise<Propietario>;
    obtenerTodos(): Promise<Propietario[]>;
    obtenerPorId(id: number): Promise<Propietario | null>;
    desactivar?(id: number): Promise<void>;
}
