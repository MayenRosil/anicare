// src/domain/use-cases/medicamento/CrearMedicamentoUseCase.ts
import { IMedicamentoRepository } from '../../interfaces/IMedicamentoRepository';
import { Medicamento } from '../../entities/Medicamento';

export class CrearMedicamentoUseCase {
  constructor(private medicamentoRepository: IMedicamentoRepository) {}

  async execute(data: Omit<Medicamento, 'id'>): Promise<number> {
    // Calcular ganancia automáticamente
    const ganancia = data.precio_venta && data.precio_compra
      ? data.precio_venta - data.precio_compra
      : 0;

    return await this.medicamentoRepository.crear({
      ...data,
      ganancia_venta: ganancia
    });
  }
}