import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerPacientes = async () => {
  const response = await axiosInstance.get('/pacientes');
  return response.data;
};
