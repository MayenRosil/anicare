// src/domain/entities/Cita.ts
export class Cita {
  constructor(
    public id: number,
    public id_paciente: number,
    public id_doctor: number,
    public id_usuario_registro: number,
    public fecha_hora: Date,
    public estado: 'Pendiente' | 'Atendida' | 'Cancelada',
    public comentario: string
  ) {}
}
