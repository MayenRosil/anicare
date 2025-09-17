import { IDoctorRepository } from "../../interfaces/IDoctorRepository";
import { Doctor } from "../../entities/Doctor";

export class CrearDoctorUseCase {
    constructor(private doctorRepository: IDoctorRepository) {}

    async execute(data: Omit<Doctor, 'id'>): Promise<Doctor>{
        return await this.doctorRepository.crear(data);
    }
}