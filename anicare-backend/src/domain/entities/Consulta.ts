// src/domain/entities/Consulta.ts
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
    
    // ✨ NUEVOS CAMPOS - Signos vitales y examen previo
    public motivo_consulta: string | null,
    public peso: number | null,
    public temperatura: number | null,
    public frecuencia_cardiaca: number | null,
    public frecuencia_respiratoria: number | null,
    public notas_adicionales: string | null
  ) {}
}