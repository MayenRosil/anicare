// anicare-frontend/src/features/propietarios/services/propietarioService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export interface Propietario {
  id?: number;
  nombre: string;
  apellido: string;
  dpi: string;
  nit: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export const obtenerPropietarios = async (): Promise<Propietario[]> => {
  const response = await axiosInstance.get('/propietarios');
  return response.data;
};

export const obtenerPropietarioPorId = async (id: number): Promise<Propietario> => {
  const response = await axiosInstance.get(`/propietarios/${id}`);
  return response.data;
};

export const crearPropietario = async (data: Omit<Propietario, 'id'>): Promise<any> => {
  const response = await axiosInstance.post('/propietarios', data);
  return response.data;
};

export const actualizarPropietario = async (id: number, data: Partial<Propietario>): Promise<any> => {
  const response = await axiosInstance.put(`/propietarios/${id}`, data);
  return response.data;
};

export const eliminarPropietario = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/propietarios/${id}`);
  return response.data;
};

// 🆕 Obtener pacientes de un propietario
export const obtenerPacientesPorPropietario = async (idPropietario: number): Promise<any[]> => {
  const response = await axiosInstance.get(`/propietarios/${idPropietario}/pacientes`);
  return response.data;
};