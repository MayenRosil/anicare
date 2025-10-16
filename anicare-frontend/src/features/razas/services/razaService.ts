// anicare-frontend/src/features/razas/services/razaService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export interface Raza {
  id?: number;
  id_especie: number;
  nombre: string;
  descripcion: string;
  nombre_especie?: string;
}

export const obtenerRazas = async (): Promise<Raza[]> => {
  const response = await axiosInstance.get('/razas');
  return response.data;
};

export const obtenerRazaPorId = async (id: number): Promise<Raza> => {
  const response = await axiosInstance.get(`/razas/${id}`);
  return response.data;
};

export const obtenerRazasPorEspecie = async (idEspecie: number): Promise<Raza[]> => {
  const response = await axiosInstance.get(`/razas/especie/${idEspecie}`);
  return response.data;
};

export const crearRaza = async (data: Omit<Raza, 'id' | 'nombre_especie'>): Promise<any> => {
  const response = await axiosInstance.post('/razas', data);
  return response.data;
};

export const actualizarRaza = async (id: number, data: Partial<Omit<Raza, 'id' | 'nombre_especie'>>): Promise<any> => {
  const response = await axiosInstance.put(`/razas/${id}`, data);
  return response.data;
};

export const eliminarRaza = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/razas/${id}`);
  return response.data;
};