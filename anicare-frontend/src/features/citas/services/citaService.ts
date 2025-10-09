import axiosInstance from '../../../shared/config/axiosConfig';

export const obtenerCitas = async () => {
  const response = await axiosInstance.get('/citas');
  return response.data;
};


export const atenderCitaCompleta = async (id: number) => {
  const response = await axiosInstance.put(`/citas/${id}/atender-completa`);
  return response.data;
};
