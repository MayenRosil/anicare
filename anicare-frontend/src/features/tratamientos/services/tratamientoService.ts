import axiosInstance from "../../../shared/config/axiosConfig";

export const obtenerTratamientosPorConsulta = async (idConsulta: number) => {
  const res = await axiosInstance.get(`/tratamientos/consulta/${idConsulta}`);
  return res.data;
};

export const actualizarTratamiento = async (id: number, data: any) => {
  const res = await axiosInstance.put(`/tratamientos/${id}`, data);
  return res.data;
};
