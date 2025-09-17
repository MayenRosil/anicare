// src/application/controllers/PropietarioController.ts
import { Request, Response } from 'express';
import { PropietarioRepository } from '../../infrastructure/repositories/PropietarioRepository';
import { CrearPropietarioUseCase } from '../../domain/use-cases/propietario/CrearPropietarioUseCase';
import { ObtenerTodosPropietariosUseCase } from '../../domain/use-cases/propietario/ObtenerTodosPropietariosUseCase';
import { ObtenerPropietarioPorIdUseCase } from '../../domain/use-cases/propietario/ObtenerPropietarioPorIdUseCase';

export class PropietarioController {
  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const repo = new PropietarioRepository();
      const useCase = new CrearPropietarioUseCase(repo);
      const nuevo = await useCase.execute(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear propietario', error });
    }
  }

  static async listar(req: Request, res: Response) : Promise<void>{
    try {
      const repo = new PropietarioRepository();
      const useCase = new ObtenerTodosPropietariosUseCase(repo);
      const propietarios = await useCase.execute();
      res.json(propietarios);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar propietarios', error });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new PropietarioRepository();
      const useCase = new ObtenerPropietarioPorIdUseCase(repo);
      const propietario = await useCase.execute(id);
      if (!propietario)  res.status(404).json({ mensaje: 'No encontrado' });
      res.json(propietario);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al buscar propietario', error });
    }
  }
}
