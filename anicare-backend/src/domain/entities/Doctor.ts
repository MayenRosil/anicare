// src/domain/entities/Paciente.ts
export class Doctor {
  constructor(
    public id: number,
    public id_usuario: number,
    public nombre: string,
    public apellido: string,
    public especialidad: string,
    public dpi: string,
    public telefono: string,
    public correo: string,
    public activo: boolean
  ) {}
}
