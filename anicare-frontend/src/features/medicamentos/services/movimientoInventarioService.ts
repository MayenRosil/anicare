// anicare-frontend/src/features/medicamentos/services/movimientoInventarioService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export interface MovimientoInventarioDTO {
  id_medicamento: number;
  tipo_movimiento: 'Entrada' | 'Salida';
  cantidad: number;
  fecha_movimiento?: string;
  observaciones?: string;
}

export const registrarMovimiento = async (data: MovimientoInventarioDTO) => {
  const res = await axiosInstance.post('/movimientos-inventario', data);
  return res.data;
};

export const obtenerMovimientosPorMedicamento = async (id_medicamento: number) => {
  const res = await axiosInstance.get(`/movimientos-inventario/medicamento/${id_medicamento}`);
  return res.data;
};

export const obtenerTodosMovimientos = async () => {
  const res = await axiosInstance.get('/movimientos-inventario');
  return res.data;
};