// src/features/consultas/services/consultaService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerConsultaPorId = async (id: number) => {
  const res = await axiosInstance.get(`/consultas/${id}`);
  return res.data;
};

// ✨ NUEVO: Obtener consulta completa con toda la info
export const obtenerConsultaCompleta = async (id: number) => {
  const res = await axiosInstance.get(`/consultas/${id}/completa`);
  return res.data;
};

export const actualizarConsulta = async (id: number, data: any) => {
  const res = await axiosInstance.put(`/consultas/${id}`, data);
  return res.data;
};

// ✨ NUEVO: Finalizar consulta
export const finalizarConsulta = async (id: number) => {
  const res = await axiosInstance.patch(`/consultas/${id}/finalizar`);
  return res.data;
};