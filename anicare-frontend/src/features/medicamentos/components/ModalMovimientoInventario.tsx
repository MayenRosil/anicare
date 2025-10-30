// anicare-frontend/src/features/medicamentos/components/ModalMovimientoInventario.tsx
import React, { useState } from 'react';
import { registrarMovimiento } from '../services/movimientoInventarioService';

interface ModalMovimientoInventarioProps {
  show: boolean;
  onClose: () => void;
  medicamento: {
    id: number;
    nombre: string;
    stock_actual: number;
  };
  tipoMovimiento: 'Entrada' | 'Salida';
  onSuccess: () => void;
}

export const ModalMovimientoInventario: React.FC<ModalMovimientoInventarioProps> = ({
  show,
  onClose,
  medicamento,
  tipoMovimiento,
  onSuccess
}) => {
  const [cantidad, setCantidad] = useState<number>(0);
  const [fechaMovimiento, setFechaMovimiento] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [observaciones, setObservaciones] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    if (tipoMovimiento === 'Salida' && cantidad > medicamento.stock_actual) {
      alert('No hay suficiente stock disponible');
      return;
    }

    try {
      setLoading(true);
      await registrarMovimiento({
        id_medicamento: medicamento.id,
        tipo_movimiento: tipoMovimiento,
        cantidad,
        fecha_movimiento: fechaMovimiento,
        observaciones: observaciones.trim() || undefined
      });

      alert(`${tipoMovimiento} registrada exitosamente`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || `Error al registrar ${tipoMovimiento.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCantidad(0);
    setObservaciones('');
    setFechaMovimiento(new Date().toISOString().split('T')[0]);
    onClose();
  };

  if (!show) return null;

  return (
    <div 
      className="modal show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Registrar {tipoMovimiento} - {medicamento.nombre}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              disabled={loading}
            />
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Stock actual */}
              <div className="alert alert-info mb-3">
                <strong>Stock actual:</strong> {medicamento.stock_actual} unidades
              </div>

              {/* Cantidad */}
              <div className="mb-3">
                <label className="form-label">
                  Cantidad <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                  min="1"
                  required
                  disabled={loading}
                />
                {tipoMovimiento === 'Salida' && cantidad > medicamento.stock_actual && (
                  <div className="text-danger mt-1">
                    <small>Stock insuficiente</small>
                  </div>
                )}
              </div>

              {/* Fecha */}
              <div className="mb-3">
                <label className="form-label">
                  Fecha <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaMovimiento}
                  onChange={(e) => setFechaMovimiento(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  disabled={loading}
                />
              </div>

              {/* Observaciones */}
              <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Opcional: Agregar notas sobre este movimiento"
                  disabled={loading}
                />
              </div>

              {/* Nuevo stock calculado */}
              <div className="alert alert-secondary">
                <strong>Nuevo stock:</strong>{' '}
                {tipoMovimiento === 'Entrada' 
                  ? medicamento.stock_actual + cantidad 
                  : medicamento.stock_actual - cantidad
                } unidades
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={`btn ${tipoMovimiento === 'Entrada' ? 'btn-success' : 'btn-warning'}`}
                disabled={loading || (tipoMovimiento === 'Salida' && cantidad > medicamento.stock_actual)}
              >
                {loading ? 'Registrando...' : `Registrar ${tipoMovimiento}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};