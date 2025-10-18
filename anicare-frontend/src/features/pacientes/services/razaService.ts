// anicare-frontend/src/features/pacientes/services/razaService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export interface Raza {
  id: number;
  id_especie: number;
  nombre: string;
  descripcion?: string;
}

export const obtenerRazas = async (): Promise<Raza[]> => {
  const response = await axiosInstance.get('/razas');
  return response.data;
};

export const obtenerRazasPorEspecie = async (idEspecie: number): Promise<Raza[]> => {
  const response = await axiosInstance.get(`/razas/especie/${idEspecie}`);
  return response.data;
};

export const obtenerRazaPorId = async (id: number): Promise<Raza> => {
  const response = await axiosInstance.get(`/razas/${id}`);
  return response.data;
};