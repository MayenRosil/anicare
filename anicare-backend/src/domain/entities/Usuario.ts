export class Usuario {
  constructor(
    public id: number,
    public nombre_usuario: string,
    public correo: string,
    public contraseña: string,
    public id_rol: number,
    public activo: boolean,
    public ultimo_login?: Date // opcional si no siempre se usa
  ) {}
}
