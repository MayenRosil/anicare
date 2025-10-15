// src/domain/entities/Medicamento.ts
export class Medicamento {
  constructor(
    public id: number | null,
    public nombre: string,
    public laboratorio: string | null,
    public presentacion: string | null,
    public unidad_medida: string | null,
    public precio_compra: number | null,
    public precio_venta: number | null,
    public ganancia_venta: number | null,
    public stock_actual: number,
    public stock_minimo: number
  ) {}
}