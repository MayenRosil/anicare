// anicare-frontend/src/features/pacientes/services/especieService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export interface Especie {
  id: number;
  nombre: string;
  descripcion: string;
}

export const obtenerEspecies = async (): Promise<Especie[]> => {
  const response = await axiosInstance.get('/especies');
  return response.data;
};

export const obtenerEspeciePorId = async (id: number): Promise<Especie> => {
  const response = await axiosInstance.get(`/especies/${id}`);
  return response.data;
};