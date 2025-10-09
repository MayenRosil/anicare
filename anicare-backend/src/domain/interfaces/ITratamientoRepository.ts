import { Tratamiento } from "../entities/Tratamiento";

export interface ITratamientoRepository {
  crear(data: Omit<Tratamiento, 'id'>, conn?: any): Promise<number>;
}
