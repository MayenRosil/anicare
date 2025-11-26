// src/domain/use-cases/cita/AtenderCitaCompletaUseCase.ts
import { ICitaRepository } from '../../interfaces/ICitaRepository';
import { IConsultaRepository } from '../../interfaces/IConsultaRepository';
import { IDiagnosticoConsultaRepository } from '../../interfaces/IDiagnosticoConsultaRepository';
import { ITratamientoRepository } from '../../interfaces/ITratamientoRepository';

const DIAGNOSTICO_POR_DEFECTO_ID = 1; // "Sin diagnóstico"
const MEDICAMENTO_POR_DEFECTO_ID = 1; // "Sin especificar"

export class AtenderCitaCompletaUseCase {
  constructor(
    private citaRepository: ICitaRepository,
    private consultaRepository: IConsultaRepository,
    private diagnosticoConsultaRepository: IDiagnosticoConsultaRepository,
    private tratamientoRepository: ITratamientoRepository
  ) {}

  /**
   * Al atender una cita:
   * 0️⃣ Verifica que la cita tenga un paciente asignado (NO NULL)
   * 1️⃣ Marca la cita como 'Atendida'
   * 2️⃣ Crea una consulta vinculada a esa cita (con signos vitales vacíos)
   * 3️⃣ Crea un diagnóstico vacío vinculado a la consulta
   * 4️⃣ Crea un tratamiento vacío vinculado al diagnóstico
   * Retorna el id de la nueva consulta
   */
  async execute(idCita: number): Promise<number> {
    // 1️⃣ Buscar la cita
    const cita = await this.citaRepository.obtenerPorId(idCita);
    if (!cita) throw new Error('Cita no encontrada');

    // ✨ NUEVO: Verificar que la cita tenga un paciente asignado
    if (cita.id_paciente === null) {
      throw new Error('No se puede atender una cita sin paciente asignado. Por favor, complete primero los datos del paciente.');
    }

    // 2️⃣ Cambiar estado a 'Atendida'
    await this.citaRepository.actualizarEstado(idCita, 'Atendida');

    // 3️⃣ Crear la consulta con los nuevos campos
    const idConsulta = await this.consultaRepository.crear({
      id_paciente: cita.id_paciente,
      id_doctor: cita.id_doctor,
      id_usuario_registro: cita.id_usuario_registro,
      id_cita: cita.id,
      fecha_hora: new Date(),
      estado: 'Abierta',
      motivo_consulta: cita.comentario || '', // ✨ Usar el comentario de la cita como motivo
      peso: null,
      temperatura: null,
      frecuencia_cardiaca: null,
      frecuencia_respiratoria: null,
      notas_adicionales: null
    });

    // 4️⃣ Crear diagnóstico vinculado a la nueva consulta
    const idDiagnosticoConsulta = await this.diagnosticoConsultaRepository.crear({
      id_consulta: idConsulta,
      id_diagnostico: DIAGNOSTICO_POR_DEFECTO_ID,
      tipo: 'Principal',
      estado: 'Activo',
      comentarios: ''
    });

    // 5️⃣ Crear tratamiento vacío vinculado al diagnóstico
    await this.tratamientoRepository.crear({
      id_diagnostico_consulta: idDiagnosticoConsulta,
      id_medicamento: MEDICAMENTO_POR_DEFECTO_ID,
      dosis: '',
      frecuencia: '',
      duracion: '',
      instrucciones: ''
    });

    // 6️⃣ Retornar el id de la consulta creada
    return idConsulta;
  }
}