// src/domain/interfaces/ICitaRepository.ts
import { Doctor } from '../entities/Doctor';

export interface IDoctorRepository {
  obtenerTodos(): Promise<Doctor[]>;
  crear(data: Omit<Doctor, 'id'>): Promise<Doctor>;
}
