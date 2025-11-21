// src/domain/entities/Paciente.ts
export class Paciente {
  constructor(
    public id: number,
    public id_propietario: number,
    public id_raza: number,
    public nombre: string,
    public sexo: 'M' | 'F',
    public fecha_nacimiento: Date,
    public color: string,
    // 🆕 NUEVOS CAMPOS
    public castrado: boolean = false,
    public adoptado: boolean = false,
    public fecha_adopcion: Date | null = null,
    public edad_aproximada: boolean = false,
    // Campos opcionales para nombres populados
    public nombre_propietario?: string,
    public nombre_raza?: string,
    public nombre_especie?: string
  ) {}
}