import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerRazas = async () => {
  const response = await axiosInstance.get('/razas');
  return response.data;
};
