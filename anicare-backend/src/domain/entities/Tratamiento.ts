export class Tratamiento {
  constructor(
    public id: number | null,
    public id_diagnostico_consulta: number,
    public id_medicamento: number | null,
    public dosis: string,
    public frecuencia: string,
    public duracion: string,
    public instrucciones: string
  ) {}
}
