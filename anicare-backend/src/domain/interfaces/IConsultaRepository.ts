import { Consulta } from "../entities/Consulta";

export interface IConsultaRepository {
  crear(data: Omit<Consulta, 'id'>, conn?: any): Promise<number>; // retorna id
   obtenerPorId(id: number): Promise<Consulta | null>;
  obtenerTodas?(): Promise<Consulta[]>; // opcional
    actualizar(id: number, data: Partial<Consulta>): Promise<void>; // 👈 nuevo
  obtenerPorPaciente(idPaciente: number): Promise<Array<{
    id: number;
    fecha_hora: Date | string;
    estado: string;
    doctor: string | null;
    diagnostico: string | null;
  }>>;

}
