// anicare-frontend/src/features/especies/services/especieService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export interface Especie {
  id?: number;
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

export const crearEspecie = async (data: Omit<Especie, 'id'>): Promise<any> => {
  const response = await axiosInstance.post('/especies', data);
  return response.data;
};

export const actualizarEspecie = async (id: number, data: Partial<Especie>): Promise<any> => {
  const response = await axiosInstance.put(`/especies/${id}`, data);
  return response.data;
};

export const eliminarEspecie = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/especies/${id}`);
  return response.data;
};