// anicare-frontend/src/features/medicamentos/pages/MedicamentosPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMedicamentos, crearMedicamento, actualizarMedicamento, eliminarMedicamento } from '../services/medicamentoService';
import { ModalMovimientoInventario } from '../components/ModalMovimientoInventario';

interface Medicamento {
  id?: number;
  nombre: string;
  laboratorio: string;
  presentacion: string | null;
  unidad_medida: string | null;
  precio_compra: number | null;
  precio_venta: number | null;
  ganancia_venta: number | null;
  stock_actual: number;
}

export default function MedicamentosPage() {
  const navigate = useNavigate();
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [medicamentoEditar, setMedicamentoEditar] = useState<Medicamento | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // Estados para el modal de movimientos
  const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);
  const [medicamentoMovimiento, setMedicamentoMovimiento] = useState<any>(null);
  const [tipoMovimiento, setTipoMovimiento] = useState<'Entrada' | 'Salida'>('Entrada');

  const [formData, setFormData] = useState({
    nombre: '',
    laboratorio: '',
    presentacion: '',
    unidad_medida: '',
    precio_compra: 0,
    precio_venta: 0,
    ganancia_venta: 0,
    stock_actual: 0
  });

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  // Calcular ganancia automáticamente
  useEffect(() => {
    const compra = formData.precio_compra || 0;
    const venta = formData.precio_venta || 0;
    const ganancia = venta - compra;
    setFormData(prev => ({ ...prev, ganancia_venta: ganancia }));
  }, [formData.precio_compra, formData.precio_venta]);

  const cargarMedicamentos = async () => {
    try {
      setLoading(true);
      const data = await obtenerMedicamentos();
      setMedicamentos(data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setMedicamentoEditar(null);
    setFormData({
      nombre: '',
      laboratorio: '',
      presentacion: '',
      unidad_medida: '',
      precio_compra: 0,
      precio_venta: 0,
      ganancia_venta: 0,
      stock_actual: 0
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (med: Medicamento) => {
    setModoEdicion(true);
    setMedicamentoEditar(med);
    setFormData({
      nombre: med.nombre,
      laboratorio: med.laboratorio,
      presentacion: med.presentacion || '',
      unidad_medida: med.unidad_medida || '',
      precio_compra: med.precio_compra || 0,
      precio_venta: med.precio_venta || 0,
      ganancia_venta: med.ganancia_venta || 0,
      stock_actual: med.stock_actual
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormData({
      nombre: '',
      laboratorio: '',
      presentacion: '',
      unidad_medida: '',
      precio_compra: 0,
      precio_venta: 0,
      ganancia_venta: 0,
      stock_actual: 0
    });
    setMedicamentoEditar(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.laboratorio.trim()) {
      alert('El nombre y laboratorio son obligatorios');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        presentacion: formData.presentacion.trim() || null,
        unidad_medida: formData.unidad_medida.trim() || null,
        precio_compra: formData.precio_compra || null,
        precio_venta: formData.precio_venta || null,
        ganancia_venta: formData.ganancia_venta || null
      };

      if (modoEdicion && medicamentoEditar) {
        await actualizarMedicamento(medicamentoEditar.id!, dataToSend);
        alert('Medicamento actualizado exitosamente');
      } else {
        await crearMedicamento(dataToSend);
        alert('Medicamento creado exitosamente');
      }

      cerrarModal();
      cargarMedicamentos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar medicamento');
    }
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este medicamento?')) {
      try {
        await eliminarMedicamento(id);
        alert('Medicamento eliminado exitosamente');
        cargarMedicamentos();
      } catch (error) {
        console.error(error);
        alert('Error al eliminar medicamento');
      }
    }
  };

  const abrirModalMovimiento = (med: Medicamento, tipo: 'Entrada' | 'Salida') => {
    setMedicamentoMovimiento(med);
    setTipoMovimiento(tipo);
    setMostrarModalMovimiento(true);
  };

  const medicamentosFiltrados = medicamentos.filter(med =>
    med.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    med.laboratorio.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando medicamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary mb-1">
            <i className="bi bi-capsule-pill me-2"></i>
            Medicamentos
          </h3>
          <p className="text-muted mb-0">
            {medicamentos.length} medicamento{medicamentos.length !== 1 ? 's' : ''} registrado{medicamentos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Dashboard
          </button>
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Medicamento
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o laboratorio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Medicamentos */}
      {medicamentosFiltrados.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay medicamentos registrados{busqueda && ' que coincidan con la búsqueda'}.
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Laboratorio</th>
                    <th>Presentación</th>
                    <th>Stock</th>
                    <th>P. Compra</th>
                    <th>P. Venta</th>
                    <th>Ganancia</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamentosFiltrados.map((med, index) => (
                    <tr key={med.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{med.nombre}</strong>
                      </td>
                      <td>{med.laboratorio}</td>
                      <td>{med.presentacion || '-'}</td>
                      <td>
                        <span className={`badge ${med.stock_actual > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {med.stock_actual}
                        </span>
                      </td>
                      <td>{med.precio_compra ? `Q ${med.precio_compra.toFixed(2)}` : '-'}</td>
                      <td>{med.precio_venta ? `Q ${med.precio_venta.toFixed(2)}` : '-'}</td>
                      <td>{med.ganancia_venta ? `Q ${med.ganancia_venta.toFixed(2)}` : '-'}</td>
                      <td className="text-center">
                        {/* Botón Entrada */}
                        <button
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => abrirModalMovimiento(med, 'Entrada')}
                          title="Registrar Entrada"
                        >
                          <i className="bi bi-arrow-down-circle"></i> Entrada
                        </button>

                        {/* Botón Salida */}
                        <button
                          className="btn btn-sm btn-outline-warning me-2"
                          onClick={() => abrirModalMovimiento(med, 'Salida')}
                          title="Registrar Salida"
                          disabled={med.stock_actual === 0}
                        >
                          <i className="bi bi-arrow-up-circle"></i> Salida
                        </button>

                        {/* Botón Editar */}
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => abrirModalEditar(med)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          className="btn btn-sm btn-outline-danger me-2"
                          onClick={() => handleEliminar(med.id!)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash-fill"></i> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal CRUD Medicamento */}
      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modoEdicion ? 'Editar Medicamento' : 'Nuevo Medicamento'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    {/* Nombre */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Nombre <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>

                    {/* Laboratorio */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Laboratorio <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.laboratorio}
                        onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    {/* Presentación */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Presentación</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.presentacion}
                        onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                        placeholder="Ej: Tabletas 500mg"
                      />
                    </div>

                    {/* Unidad de medida */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Unidad de Medida</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.unidad_medida}
                        onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                        placeholder="Ej: Tableta, ml, cápsula"
                      />
                    </div>
                  </div>

                  <div className="row">
                    {/* Precio Compra */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Precio Compra (Q)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.precio_compra}
                        onChange={(e) => setFormData({ ...formData, precio_compra: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    {/* Precio Venta */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Precio Venta (Q)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.precio_venta}
                        onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    {/* Ganancia (calculada automáticamente) */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Ganancia (Q)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.ganancia_venta}
                        readOnly
                        style={{ backgroundColor: '#e9ecef' }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    {/* Stock Actual */}
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Stock Actual <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.stock_actual}
                        onChange={(e) => setFormData({ ...formData, stock_actual: parseInt(e.target.value) || 0 })}
                        required
                        disabled={modoEdicion}
                      />
                      {modoEdicion && (
                        <small className="text-muted">
                          Para modificar el stock, usa los botones "Entrada" o "Salida" en la tabla
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <small>
                      <strong>Nota:</strong> Los campos marcados con <span className="text-danger">*</span> son obligatorios.
                      Los demás campos son opcionales y pueden usarse cuando el medicamento se venda en la clínica.
                    </small>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modoEdicion ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Movimiento de Inventario */}
      {mostrarModalMovimiento && medicamentoMovimiento && (
        <ModalMovimientoInventario
          show={mostrarModalMovimiento}
          onClose={() => setMostrarModalMovimiento(false)}
          medicamento={medicamentoMovimiento}
          tipoMovimiento={tipoMovimiento}
          onSuccess={cargarMedicamentos}
        />
      )}
    </div>
  );
}