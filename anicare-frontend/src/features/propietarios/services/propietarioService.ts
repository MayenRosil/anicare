import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerPropietarios = async () => {
  const response = await axiosInstance.get('/propietarios');
  return response.data;
};
