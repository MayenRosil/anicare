import { Consulta } from "../entities/Consulta";

export interface IConsultaRepository {
  crear(data: Omit<Consulta, 'id'>, conn?: any): Promise<number>; // retorna id
}
