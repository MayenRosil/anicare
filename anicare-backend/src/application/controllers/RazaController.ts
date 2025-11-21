// src/application/controllers/RazaController.ts
import { Request, Response } from 'express';
import pool from '../../shared/config/db';
import { RazaRepository } from '../../infrastructure/repositories/RazaRepository';
import { ObtenerTodasRazasUseCase } from '../../domain/use-cases/raza/ObtenerTodasRazasUseCase';
import { CrearRazaUseCase } from '../../domain/use-cases/raza/CrearRazaUseCase';
import { EliminarRazaUseCase } from '../../domain/use-cases/raza/EliminarRazaUseCase';
import { ActualizarRazaUseCase } from '../../domain/use-cases/raza/ActualizarRazaUseCase';
import { ObtenerRazasPorEspecieUseCase } from '../../domain/use-cases/raza/ObtenerRazasPorEspecieUseCase';
import { ObtenerRazaPorIdUseCase } from '../../domain/use-cases/raza/ObtenerRazaPorIdUseCase';
import { BuscarOCrearRazaPersonalizadaUseCase } from '../../domain/use-cases/raza/BuscarOCrearRazaPersonalizadaUseCase ';

export class RazaController {
  static async listarTodos(req: Request, res: Response): Promise<void> {
    try {
      const repo = new RazaRepository();
      const useCase = new ObtenerTodasRazasUseCase(repo);
      const razas = await useCase.execute();
      res.json(razas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar razas', error });
    }
  }

  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const repo = new RazaRepository();
      const useCase = new CrearRazaUseCase(repo);
      const idRaza = await useCase.execute(req.body);
      res.status(201).json({
        mensaje: 'Raza creada exitosamente',
        id: idRaza
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear raza', error });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new RazaRepository();
      const useCase = new ObtenerRazaPorIdUseCase(repo);
      const raza = await useCase.execute(id);

      if (!raza) {
        res.status(404).json({ mensaje: 'Raza no encontrada' });
        return;
      }

      res.json(raza);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener raza', error });
    }
  }

  static async obtenerPorEspecie(req: Request, res: Response): Promise<void> {
    try {
      const idEspecie = parseInt(req.params.idEspecie);
      const repo = new RazaRepository();
      const useCase = new ObtenerRazasPorEspecieUseCase(repo);
      const razas = await useCase.execute(idEspecie);
      res.json(razas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener razas por especie', error });
    }
  }

  // 🆕 NUEVO ENDPOINT: Buscar o crear raza personalizada
  static async buscarOCrearPersonalizada(req: Request, res: Response): Promise<void> {
    try {
      const { nombre_raza, especie_personalizada } = req.body;

      if (!nombre_raza || !especie_personalizada) {
        res.status(400).json({
          mensaje: 'Se requiere nombre_raza y especie_personalizada'
        });
        return;
      }

      const repo = new RazaRepository();
      const useCase = new BuscarOCrearRazaPersonalizadaUseCase(repo);
      const idRaza = await useCase.execute(nombre_raza, especie_personalizada);

      res.status(200).json({
        mensaje: 'Raza obtenida o creada exitosamente',
        id: idRaza
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al buscar o crear raza personalizada',
        error
      });
    }
  }

  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new RazaRepository();
      const useCase = new ActualizarRazaUseCase(repo);
      await useCase.execute(id, req.body);
      res.json({ mensaje: 'Raza actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar raza', error });
    }
  }

  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const repo = new RazaRepository();
      const useCase = new EliminarRazaUseCase(repo);
      await useCase.execute(id);
      res.json({ mensaje: 'Raza eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al eliminar raza', error });
    }
  }
}