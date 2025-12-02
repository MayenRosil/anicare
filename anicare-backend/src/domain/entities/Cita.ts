// src/domain/entities/Cita.ts
export type EstadoCita = 'Pendiente' | 'Atendida' | 'Cancelada';

export class Cita {
  constructor(
    public id: number | undefined,
    public id_paciente: number | null,
    public id_doctor: number,
    public id_usuario_registro: number,
    public fecha_hora: Date,
    public estado: EstadoCita,
    public es_grooming: boolean, // ✨ SOLO ESTO
    public comentario: string | null,
    // Campos opcionales del JOIN
    public paciente_nombre?: string,
    public doctor_nombre?: string,
    public doctor_apellido?: string,
    public propietario_nombre?: string,
    public propietario_apellido?: string,
    public propietario_telefono?: string
  ) {}
}