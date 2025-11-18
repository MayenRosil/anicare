// src/domain/interfaces/IPropietarioRepository.ts
import { Propietario } from '../entities/Propietario';

export interface IPropietarioRepository {
    crear(propietario: Omit<Propietario, 'id'>): Promise<Propietario>;
    obtenerTodos(): Promise<Propietario[]>;
    obtenerPorId(id: number): Promise<Propietario | null>;
    actualizar(id: number, data: Partial<Propietario>): Promise<void>;
    eliminar(id: number): Promise<void>;
    desactivar?(id: number): Promise<void>;
}