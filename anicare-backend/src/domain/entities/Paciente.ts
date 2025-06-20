// src/domain/entities/Paciente.ts
export class Paciente {
  constructor(
    public id: number,
    public id_propietario: number,
    public id_raza: number,
    public nombre: string,
    public sexo: 'M' | 'F',
    public fecha_nacimiento: Date,
    public color: string
  ) {}
}
