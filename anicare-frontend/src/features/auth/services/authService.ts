import axiosInstance from '../../../shared/config/axiosConfig';

export const loginRequest = async (correo: string, contraseña: string) => {
  const response = await axiosInstance.post('/auth/login', { correo, contraseña });
  return response.data;
};
