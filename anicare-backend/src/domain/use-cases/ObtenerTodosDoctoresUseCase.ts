import { IDoctorRepository } from '../interfaces/IDoctorRepository';
import { Doctor } from '../entities/Doctor';

export class ObtenerTodosDoctoresUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(): Promise<Doctor[]> {
    return await this.doctorRepository.obtenerTodos();
  }
}
