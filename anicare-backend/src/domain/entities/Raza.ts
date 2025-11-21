// src/domain/entities/Raza.ts
export class Raza {
  constructor(
    public id: number,
    public id_especie: number,
    public nombre: string,
    public descripcion: string,
    // 🆕 NUEVO CAMPO para especies personalizadas
    public especie_personalizada: string | null = null
  ) {}
}