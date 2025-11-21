// anicare-frontend/src/features/pacientes/services/razaService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export interface Raza {
  id: number;
  id_especie: number;
  nombre: string;
  descripcion: string;
  especie_personalizada?: string | null;
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

// 🆕 Obtener razas por especie
export const obtenerRazasPorEspecie = async (idEspecie: number): Promise<Raza[]> => {
  const response = await axiosInstance.get(`/razas/especie/${idEspecie}`);
  return response.data;
};

// 🆕 Buscar o crear raza personalizada
export const buscarOCrearRazaPersonalizada = async (
  nombreRaza: string,
  especiePersonalizada: string
): Promise<{ id: number; mensaje: string }> => {
  const response = await axiosInstance.post('/razas/personalizada', {
    nombre_raza: nombreRaza,
    especie_personalizada: especiePersonalizada
  });
  return response.data;
};

export const crearRaza = async (data: Omit<Raza, 'id'>): Promise<{ id: number }> => {
  const response = await axiosInstance.post('/razas', data);
  return response.data;
};

export const actualizarRaza = async (id: number, data: Partial<Raza>): Promise<void> => {
  await axiosInstance.put(`/razas/${id}`, data);
};

export const eliminarRaza = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/razas/${id}`);
};