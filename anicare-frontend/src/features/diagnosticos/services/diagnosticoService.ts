import axiosInstance from "../../../shared/config/axiosConfig";

export const obtenerDiagnosticosPorConsulta = async (idConsulta: number) => {
  const res = await axiosInstance.get(`/diagnosticos/consulta/${idConsulta}`);
  return res.data;
};

export const actualizarDiagnostico = async (id: number, data: any) => {
  const res = await axiosInstance.put(`/diagnosticos/${id}`, data);
  return res.data;
};
