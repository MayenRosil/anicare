// src/domain/entities/Propietario.ts
export class Propietario {
  constructor(
    public id: number,
    public nombre: string,
    public apellido: string,
    public dpi: string,
    public nit: string,
    public direccion: string,
    public telefono: string,
    public correo: string
  ) {}
}
