// src/domain/interfaces/ICitaRepository.ts
import { Doctor } from '../entities/Doctor';

export interface IDoctorRepository {
  obtenerTodos(): Promise<Doctor[]>;
}
