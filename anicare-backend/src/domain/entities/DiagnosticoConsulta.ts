export type TipoDiagnostico = 'Principal' | 'Secundario';
export type EstadoDiagnostico = 'Activo' | 'Confirmado' | 'Presuntivo';

export class DiagnosticoConsulta {
  constructor(
    public id: number | null,
    public id_consulta: number,
    public id_diagnostico: number | null, // catálogo opcional
    public tipo: TipoDiagnostico,
    public estado: EstadoDiagnostico,
    public comentarios: string | null
  ) {}
}
