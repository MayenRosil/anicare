export type EstadoConsulta = 'Abierta' | 'Finalizada' | 'Cancelada';

export class Consulta {
  constructor(
    public id: number | null,
    public id_paciente: number,
    public id_doctor: number,
    public id_usuario_registro: number,
    public id_cita: number | null,
    public fecha_hora: Date,
    public estado: EstadoConsulta,
    public notas_adicionales: string | null
  ) {}
}
