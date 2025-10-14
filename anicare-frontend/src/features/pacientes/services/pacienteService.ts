import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerPacientes = async () => {
  const response = await axiosInstance.get('/pacientes');
  return response.data;
};

export const crearPaciente = async (data: any) => {
  const response = await axiosInstance.post('/pacientes', data);
  return response.data;
};


export const obtenerConsultasPorPaciente = async (idPaciente: number) => {
  try {
    const res = await axiosInstance.get(`/pacientes/${idPaciente}/consultas`);
    return res.data;
  } catch (error: any) {
    console.error("Error al obtener historial clínico del paciente:", error);
    throw error;
  }
};