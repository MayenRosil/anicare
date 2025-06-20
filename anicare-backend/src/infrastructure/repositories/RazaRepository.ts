// src/infrastructure/repositories/PropietarioRepository.ts
import { IRazaRepository } from '../../domain/interfaces/IRazaRepository';
import { Raza } from '../../domain/entities/Raza';
import pool from '../../shared/config/db';

export class RazaRepository implements IRazaRepository {

  async obtenerTodos(): Promise<Raza[]> {
    const [rows]: any = await pool.query('SELECT * FROM Raza');
    return rows.map((row: any) =>
      new Raza(
        row.id,
        row.id_especie,
        row.nombre,
        row.descripcion
      )
    );
  }


}
