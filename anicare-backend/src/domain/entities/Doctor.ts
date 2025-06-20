// src/domain/entities/Paciente.ts
export class Doctor {
  constructor(
    public id: number,
    public id_usuario: number,
    public nombre: string,
    public apellido: string,
    especialidad: string,
    dpi: string,
    telefono: string,
    correo: string,
    activo: boolean
  ) {}
}
