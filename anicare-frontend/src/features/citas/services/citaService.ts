import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerCitas = async () => {
  const response = await axiosInstance.get('/citas');
  return response.data;
};
