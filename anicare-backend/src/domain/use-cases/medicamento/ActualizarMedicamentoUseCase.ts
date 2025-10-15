// src/domain/use-cases/medicamento/ActualizarMedicamentoUseCase.ts
import { IMedicamentoRepository } from '../../interfaces/IMedicamentoRepository';
import { Medicamento } from '../../entities/Medicamento';

export class ActualizarMedicamentoUseCase {
  constructor(private medicamentoRepository: IMedicamentoRepository) {}

  async execute(id: number, data: Partial<Medicamento>): Promise<void> {
    // Si vienen los precios, recalcular ganancia
    if (data.precio_compra && data.precio_venta) {
      data.ganancia_venta = data.precio_venta - data.precio_compra;
    }

    await this.medicamentoRepository.actualizar(id, data);
  }
}