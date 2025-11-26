// src/domain/entities/Consulta.ts
export type EstadoConsulta = 'Abierta' | 'Finalizada' | 'Cancelada';

export class Consulta {
  constructor(
    public id: number | null,
    public id_paciente: number,
    public id_doctor: number,
    public id_usuario_registro: number,
    public id_cita: number | null,
    public fecha_hora: Date,
    public estado: EstadoConsulta,
    
    // Examen Clínico Básico
    public motivo_consulta: string | null,
    public peso: number | null,
    public temperatura: number | null,
    public frecuencia_cardiaca: number | null,
    public frecuencia_respiratoria: number | null,
    public notas_adicionales: string | null,
    
    // ✨ NUEVOS CAMPOS: Anamnesis e Historia Clínica
    public anamnesis: string | null,
    public historia_clinica: string | null,
    
    // ✨ NUEVOS CAMPOS: Signos Vitales Adicionales
    public pulso_arterial: string | null,
    public tllc: string | null,
    public color_mucosas: string | null,
    
    // ✨ NUEVOS CAMPOS: Evaluación General
    public condicion_corporal: string | null,
    public estado_hidratacion: string | null,
    public estado_mental: string | null,
    
    // ✨ NUEVOS CAMPOS: Exploración Respiratoria
    public palmo_percusion_toracica: string | null,
    public auscultacion_pulmonar: string | null,
    
    // ✨ NUEVOS CAMPOS: Reflejos Fisiológicos
    public reflejo_tusigeno: string | null,
    public reflejo_deglutorio: string | null,
    
    // ✨ NUEVOS CAMPOS: Otros Hallazgos
    public postura_marcha: string | null,
    
    // ✨ NUEVO CAMPO: Laboratorios
    public laboratorios: string | null
  ) {}
}