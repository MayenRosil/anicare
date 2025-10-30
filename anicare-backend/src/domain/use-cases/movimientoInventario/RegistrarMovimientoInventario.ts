// anicare-backend/src/application/use-cases/RegistrarMovimientoInventario.ts
import { IMovimientoInventarioRepository } from '../../../domain/interfaces/IMovimientoInventarioRepository';
import { IMedicamentoRepository } from '../../../domain/interfaces/IMedicamentoRepository';

export class RegistrarMovimientoInventario {
  constructor(
    private movimientoRepo: IMovimientoInventarioRepository,
    private medicamentoRepo: IMedicamentoRepository
  ) {}

  async execute(
    id_medicamento: number,
    tipo_movimiento: 'Entrada' | 'Salida',
    cantidad: number,
    fecha_movimiento: Date,
    observaciones: string | null,
    id_usuario: number | null
  ): Promise<number> {
    // 1. Obtener el medicamento actual
    const medicamento = await this.medicamentoRepo.obtenerPorId(id_medicamento);
    
    if (!medicamento) {
      throw new Error('Medicamento no encontrado');
    }

    // 2. Calcular el nuevo stock
    let nuevoStock = medicamento.stock_actual;
    
    if (tipo_movimiento === 'Entrada') {
      nuevoStock += cantidad;
    } else if (tipo_movimiento === 'Salida') {
      nuevoStock -= cantidad;
      
      // Validar que no quede stock negativo
      if (nuevoStock < 0) {
        throw new Error('Stock insuficiente para realizar la salida');
      }
    }

    // 3. Actualizar el stock del medicamento
    await this.medicamentoRepo.actualizarStock(id_medicamento, nuevoStock);

    // 4. Registrar el movimiento
    const movimientoId = await this.movimientoRepo.crear({
      id_medicamento,
      tipo_movimiento,
      cantidad,
      fecha_movimiento,
      observaciones,
      id_usuario
    });

    return movimientoId;
  }
}