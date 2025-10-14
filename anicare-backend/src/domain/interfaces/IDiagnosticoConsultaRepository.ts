import { DiagnosticoConsulta } from "../entities/DiagnosticoConsulta";

export interface IDiagnosticoConsultaRepository {
  crear(data: Omit<DiagnosticoConsulta, "id">): Promise<number>;
  obtenerPorId(id: number): Promise<DiagnosticoConsulta | null>;
  obtenerPorConsulta(id_consulta: number): Promise<DiagnosticoConsulta[]>;
  actualizar(id: number, data: Partial<DiagnosticoConsulta>): Promise<void>; // 👈 nuevo
}
