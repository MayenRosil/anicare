// src/features/citas/services/citaService.ts
import axiosInstance from '../../../shared/config/axiosConfig';

export interface Cita {
  id: number;
  id_paciente: number | null;
  id_doctor: number;
  fecha_hora: string;
  estado: 'Pendiente' | 'Atendida' | 'Cancelada';
  es_grooming: boolean; // ✨ AGREGAR ESTO
  comentario: string;
  // Campos poblados
  paciente_nombre?: string;
  propietario_nombre?: string;
  doctor_nombre?: string;
  doctor_apellido?: string;
  esPacienteNuevo?: boolean;
}

export const obtenerCitas = async (): Promise<Cita[]> => {
  const response = await axiosInstance.get('/citas');
  return response.data;
};

export const obtenerCitasConDetalles = async (): Promise<Cita[]> => {
  const response = await axiosInstance.get('/citas/detalles');
  return response.data;
};

// ✨ MODIFICADO: Agregar es_grooming
export const crearCita = async (data: {
  id_paciente: number | null;
  id_doctor: number;
  fecha_hora: string;
  es_grooming?: boolean; // ✨ AGREGAR ESTO
  comentario?: string;
}): Promise<Cita> => {
  const response = await axiosInstance.post('/citas', {
    ...data,
    es_grooming: data.es_grooming || false // ✨ AGREGAR ESTO
  });
  return response.data;
};

export const actualizarEstadoCita = async (id: number, estado: string): Promise<any> => {
  const response = await axiosInstance.patch(`/citas/${id}/estado`, { estado });
  return response.data;
};

export const actualizarPacienteCita = async (idCita: number, idPaciente: number): Promise<any> => {
  const response = await axiosInstance.patch(`/citas/${idCita}/paciente`, { id_paciente: idPaciente });
  return response.data;
};

export const atenderCitaCompleta = async (id: number): Promise<{ id_consulta: number }> => {
  const response = await axiosInstance.post(`/citas/${id}/atender`);
  return response.data;
};