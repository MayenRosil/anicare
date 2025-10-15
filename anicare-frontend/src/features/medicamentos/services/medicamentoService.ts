// src/features/medicamentos/services/medicamentoService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerMedicamentos = async () => {
  const res = await axiosInstance.get('/medicamentos');
  return res.data;
};

export const obtenerMedicamentoPorId = async (id: number) => {
  const res = await axiosInstance.get(`/medicamentos/${id}`);
  return res.data;
};

export const crearMedicamento = async (data: any) => {
  const res = await axiosInstance.post('/medicamentos', data);
  return res.data;
};

export const actualizarMedicamento = async (id: number, data: any) => {
  const res = await axiosInstance.put(`/medicamentos/${id}`, data);
  return res.data;
};

export const eliminarMedicamento = async (id: number) => {
  const res = await axiosInstance.delete(`/medicamentos/${id}`);
  return res.data;
};