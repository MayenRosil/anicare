// anicare-backend/src/domain/entities/MovimientoInventario.ts
export class MovimientoInventario {
  constructor(
    public id: number | null,
    public id_medicamento: number,
    public tipo_movimiento: 'Entrada' | 'Salida',
    public cantidad: number,
    public fecha_movimiento: Date,
    public observaciones: string | null,
    public id_usuario: number | null
  ) {}
}