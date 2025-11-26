// src/features/pacientes/services/especieService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerEspecies = async () => {
  const response = await axiosInstance.get('/especies');
  return response.data;
};