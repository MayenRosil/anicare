// src/domain/entities/DiagnosticoConsulta.ts

export class DiagnosticoConsulta {
  constructor(
    public id: number | null,
    public id_consulta: number,
    public id_diagnostico: number | null, // catálogo opcional (siempre usar ID 1)
    public comentarios: string | null // Aquí el doctor escribe el diagnóstico real
  ) {}
}