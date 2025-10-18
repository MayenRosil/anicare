// anicare-frontend/src/features/pacientes/services/pacienteService.ts

import axiosInstance from '../../../shared/config/axiosConfig';

export interface Paciente {
  id?: number;
  id_propietario: number;
  id_raza: number;
  nombre: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  color: string;
  nombre_propietario?: string;
  nombre_raza?: string;
  nombre_especie?: string;
}

export const obtenerPacientes = async (): Promise<Paciente[]> => {
  const response = await axiosInstance.get('/pacientes');
  return response.data;
};

export const obtenerPacientePorId = async (id: number): Promise<Paciente> => {
  const response = await axiosInstance.get(`/pacientes/${id}`);
  return response.data;
};

export const crearPaciente = async (data: Omit<Paciente, 'id'>): Promise<any> => {
  const response = await axiosInstance.post('/pacientes', data);
  return response.data;
};

export const actualizarPaciente = async (id: number, data: Partial<Paciente>): Promise<any> => {
  const response = await axiosInstance.put(`/pacientes/${id}`, data);
  return response.data;
};

export const eliminarPaciente = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/pacientes/${id}`);
  return response.data;
};

// ✅ CAMBIAR LA RUTA AQUÍ
export const obtenerConsultasPorPaciente = async (idPaciente: number) => {
  try {
    // OPCIÓN 1: Usar la ruta de consultas
    const res = await axiosInstance.get(`/consultas/paciente/${idPaciente}`);
    return res.data;
    
    // OPCIÓN 2: O usar la ruta de pacientes (si está configurada)
    // const res = await axiosInstance.get(`/pacientes/${idPaciente}/consultas`);
    // return res.data;
  } catch (error: any) {
    console.error("Error al obtener historial clínico del paciente:", error);
    throw error;
  }
};