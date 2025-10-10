import axiosInstance from "../../../shared/config/axiosConfig";

export const obtenerConsultaPorId = async (id: number) => {
  const res = await axiosInstance.get(`/consultas/${id}`);
  return res.data;
};

export const actualizarConsulta = async (id: number, data: any) => {
  const res = await axiosInstance.put(`/consultas/${id}`, data);
  return res.data;
};
