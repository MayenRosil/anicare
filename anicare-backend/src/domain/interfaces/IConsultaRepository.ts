// src/domain/interfaces/IConsultaRepository.ts
import { Consulta } from "../entities/Consulta";

export interface IConsultaRepository {
  crear(data: Omit<Consulta, "id">): Promise<number>;
  obtenerPorId(id: number): Promise<Consulta | null>;
  obtenerConsultaCompleta(id: number): Promise<any>; // ✨ NUEVO
  obtenerTodas(): Promise<Consulta[]>;
  actualizar(id: number, data: Partial<Consulta>): Promise<void>;
  finalizarConsulta(id: number): Promise<void>; // ✨ NUEVO
  obtenerPorPaciente(idPaciente: number): Promise<any[]>;
}