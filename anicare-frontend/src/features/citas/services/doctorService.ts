import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerDoctores = async () => {
  const response = await axiosInstance.get('/doctores');
  return response.data;
};
