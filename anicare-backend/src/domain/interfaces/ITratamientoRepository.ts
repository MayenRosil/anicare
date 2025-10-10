import { Tratamiento } from "../entities/Tratamiento";

export interface ITratamientoRepository {
  crear(data: Omit<Tratamiento, "id">): Promise<number>;
  obtenerPorId(id: number): Promise<Tratamiento | null>;
  obtenerPorDiagnostico(id_diagnostico_consulta: number): Promise<Tratamiento[]>;
  actualizar(id: number, data: Partial<Tratamiento>): Promise<void>; // 👈 nuevo
}
