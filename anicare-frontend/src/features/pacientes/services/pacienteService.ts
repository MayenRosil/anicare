// ============================================
// PACIENTE SERVICE - COMPLETO CON HISTORIAL
// ============================================

import axiosInstance from '../../../shared/config/axiosConfig';

// ============================================
// INTERFACES
// ============================================

// Interface para Paciente completo (ACTUALIZADA)
export interface Paciente {
  id: number;
  id_propietario: number;
  id_raza: number;
  nombre: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  color: string;
  
  // ========== CAMPOS NUEVOS ==========
  castrado: boolean;
  adoptado: boolean;
  fecha_adopcion?: string | null;
  edad_aproximada: boolean;
  // ===================================
  
  // Campos populados desde el backend (JOINs)
  nombre_propietario?: string;
  apellido_propietario?: string;
  nombre_raza?: string;
  nombre_especie?: string;
  activo?: boolean;
}

// Interface para el formulario de Paciente (ACTUALIZADA)
export interface PacienteFormData {
  nombre: string;
  sexo: 'M' | 'F';
  color: string;
  fecha_nacimiento: string;
  id_raza: number;
  id_propietario: number;
  
  // ========== CAMPOS NUEVOS ==========
  castrado: boolean;
  adoptado: boolean;
  fecha_adopcion?: string | null;
  edad_aproximada: boolean;
  // ===================================
}

// Interface para Consulta (Historial Clínico)
export interface Consulta {
  id: number;
  id_paciente: number;
  id_doctor: number;
  fecha_consulta: string;
  motivo_consulta: string;
  peso?: number;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  observaciones?: string;
  activo?: boolean;
  
  // Campos populados
  nombre_doctor?: string;
  apellido_doctor?: string;
  nombre_paciente?: string;
}

// ============================================
// SERVICE FUNCTIONS - PACIENTES
// ============================================

export const obtenerPacientes = async (): Promise<Paciente[]> => {
  const response = await axiosInstance.get('/pacientes');
  return response.data;
};

export const obtenerPacientePorId = async (id: number): Promise<Paciente> => {
  const response = await axiosInstance.get(`/pacientes/${id}`);
  return response.data;
};

export const crearPaciente = async (data: PacienteFormData): Promise<Paciente> => {
  const response = await axiosInstance.post('/pacientes', data);
  return response.data;
};

export const actualizarPaciente = async (id: number, data: PacienteFormData): Promise<Paciente> => {
  const response = await axiosInstance.put(`/pacientes/${id}`, data);
  return response.data;
};

export const eliminarPaciente = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/pacientes/${id}`);
};

export const buscarPacientes = async (termino: string): Promise<Paciente[]> => {
  const response = await axiosInstance.get(`/pacientes/buscar?termino=${termino}`);
  return response.data;
};

// ============================================
// SERVICE FUNCTIONS - HISTORIAL CLÍNICO
// ============================================

// Obtener todas las consultas de un paciente (Historial Clínico)
export const obtenerConsultasPorPaciente = async (idPaciente: number): Promise<Consulta[]> => {
  const response = await axiosInstance.get(`/pacientes/${idPaciente}/consultas`);
  return response.data;
};

// Obtener una consulta específica
export const obtenerConsultaPorId = async (idConsulta: number): Promise<Consulta> => {
  const response = await axiosInstance.get(`/consultas/${idConsulta}`);
  return response.data;
};

// Crear una nueva consulta
export const crearConsulta = async (data: any): Promise<Consulta> => {
  const response = await axiosInstance.post('/consultas', data);
  return response.data;
};

// Actualizar una consulta existente
export const actualizarConsulta = async (id: number, data: any): Promise<Consulta> => {
  const response = await axiosInstance.put(`/consultas/${id}`, data);
  return response.data;
};

// Eliminar una consulta
export const eliminarConsulta = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/consultas/${id}`);
};