// anicare-backend/src/application/controllers/MovimientoInventarioController.ts
import { Request, Response } from 'express';
import { MovimientoInventarioRepository } from '../../infrastructure/repositories/MovimientoInventarioRepository';
import { MedicamentoRepository } from '../../infrastructure/repositories/MedicamentoRepository';
import { RegistrarMovimientoInventario } from '../../domain/use-cases/movimientoInventario/RegistrarMovimientoInventario';

export class MovimientoInventarioController {
  // Registrar un nuevo movimiento (entrada o salida)
  static async registrarMovimiento(req: Request, res: Response): Promise<void> {
    try {
      const { id_medicamento, tipo_movimiento, cantidad, fecha_movimiento, observaciones } = req.body;
      const id_usuario = (req as any).usuario?.id || null;

      // Validaciones
      if (!id_medicamento || !tipo_movimiento || !cantidad) {
        res.status(400).json({ message: 'Faltan campos obligatorios' });
        return;
      }

      if (tipo_movimiento !== 'Entrada' && tipo_movimiento !== 'Salida') {
        res.status(400).json({ message: 'Tipo de movimiento inválido' });
        return;
      }

      if (cantidad <= 0) {
        res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
        return;
      }

      const movimientoRepo = new MovimientoInventarioRepository();
      const medicamentoRepo = new MedicamentoRepository();
      const useCase = new RegistrarMovimientoInventario(movimientoRepo, medicamentoRepo);

      const movimientoId = await useCase.execute(
        id_medicamento,
        tipo_movimiento,
        cantidad,
        fecha_movimiento ? new Date(fecha_movimiento) : new Date(),
        observaciones || null,
        id_usuario
      );

      res.status(201).json({ 
        message: 'Movimiento registrado exitosamente',
        id: movimientoId 
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || 'Error al registrar movimiento' });
    }
  }

  // Obtener movimientos por medicamento
  static async obtenerPorMedicamento(req: Request, res: Response): Promise<void> {
    try {
      const { id_medicamento } = req.params;
      
      const repo = new MovimientoInventarioRepository();
      const movimientos = await repo.obtenerPorMedicamento(parseInt(id_medicamento));
      
      res.json(movimientos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener movimientos' });
    }
  }

  // Obtener todos los movimientos
  static async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {
      const repo = new MovimientoInventarioRepository();
      const movimientos = await repo.obtenerTodos();
      
      res.json(movimientos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener movimientos' });
    }
  }
}