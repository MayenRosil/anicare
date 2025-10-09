import { DiagnosticoConsulta } from "../entities/DiagnosticoConsulta";

export interface IDiagnosticoConsultaRepository {
  crear(data: Omit<DiagnosticoConsulta, 'id'>, conn?: any): Promise<number>;
}
