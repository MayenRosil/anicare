import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerPacientes = async () => {
  const response = await axiosInstance.get('/pacientes');
  return response.data;
};

export const crearPaciente = async (data: any) => {
  const response = await axiosInstance.post('/pacientes', data);
  return response.data;
};
