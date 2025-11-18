// anicare-frontend/src/features/doctores/services/doctorService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export interface Doctor {
  id?: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  dpi: string;
  telefono: string;
  correo: string;
  colegiado: string;
  activo?: boolean;
}

export const obtenerDoctores = async (): Promise<Doctor[]> => {
  const response = await axiosInstance.get('/doctores');
  return response.data;
};

export const obtenerDoctorPorId = async (id: number): Promise<Doctor> => {
  const response = await axiosInstance.get(`/doctores/${id}`);
  return response.data;
};

export const crearDoctor = async (data: Omit<Doctor, 'id'>): Promise<any> => {
  const response = await axiosInstance.post('/doctores', data);
  return response.data;
};

export const actualizarDoctor = async (id: number, data: Partial<Doctor>): Promise<any> => {
  const response = await axiosInstance.put(`/doctores/${id}`, data);
  return response.data;
};

export const eliminarDoctor = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/doctores/${id}`);
  return response.data;
};