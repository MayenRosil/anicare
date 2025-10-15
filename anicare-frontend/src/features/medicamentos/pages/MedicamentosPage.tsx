// src/features/medicamentos/pages/MedicamentosPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMedicamentos, crearMedicamento, actualizarMedicamento, eliminarMedicamento } from '../services/medicamentoService';

interface Medicamento {
  id: number;
  nombre: string;
  laboratorio: string;
  presentacion: string;
  unidad_medida: string;
  precio_compra: number;
  precio_venta: number;
  ganancia_venta: number;
  stock_actual: number;
  stock_minimo: number;
}

export default function MedicamentosPage() {
  const navigate = useNavigate();
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [medicamentoEditar, setMedicamentoEditar] = useState<Medicamento | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    laboratorio: '',
    presentacion: '',
    unidad_medida: '',
    precio_compra: 0,
    precio_venta: 0,
    ganancia_venta: 0,
    stock_actual: 0,
    stock_minimo: 0
  });

  useEffect(() => {
    cargarMedicamentos();
  }, []);

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
      stock_actual: 0,
      stock_minimo: 0
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (med: Medicamento) => {
    setModoEdicion(true);
    setMedicamentoEditar(med);
    setFormData({
      nombre: med.nombre,
      laboratorio: med.laboratorio,
      presentacion: med.presentacion,
      unidad_medida: med.unidad_medida,
      precio_compra: Number(med.precio_compra),
      precio_venta: Number(med.precio_venta),
      ganancia_venta: Number(med.ganancia_venta),
      stock_actual: Number(med.stock_actual),
      stock_minimo: Number(med.stock_minimo)
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modoEdicion && medicamentoEditar) {
        await actualizarMedicamento(medicamentoEditar.id, formData);
        alert('Medicamento actualizado correctamente');
      } else {
        await crearMedicamento(formData);
        alert('Medicamento creado correctamente');
      }
      
      setMostrarModal(false);
      cargarMedicamentos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el medicamento');
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar el medicamento "${nombre}"?`)) return;
    
    try {
      await eliminarMedicamento(id);
      alert('Medicamento eliminado correctamente');
      cargarMedicamentos();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar el medicamento');
    }
  };

  const medicamentosFiltrados = medicamentos.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.laboratorio.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <p className="p-4">Cargando medicamentos...</p>;

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary mb-1">💊 Gestión de Medicamentos</h3>
          <p className="text-muted mb-0">Control de inventario farmacéutico</p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/dashboard')}>
            ← Volver
          </button>
          <button className="btn btn-success" onClick={abrirModalNuevo}>
            + Nuevo Medicamento
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Buscar por nombre o laboratorio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
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
                  <th className="text-end">P. Compra</th>
                  <th className="text-end">P. Venta</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicamentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      No se encontraron medicamentos
                    </td>
                  </tr>
                ) : (
                  medicamentosFiltrados.map((med, index) => (
                    <tr key={med.id}>
                      <td>{index + 1}</td>
                      <td className="fw-bold">{med.nombre}</td>
                      <td>{med.laboratorio}</td>
                      <td>{med.presentacion}</td>
                      <td className="text-end">Q{Number(med.precio_compra).toFixed(2)}</td>
                      <td className="text-end">Q{Number(med.precio_venta).toFixed(2)}</td>
                      <td className="text-center">
                        <span className={`badge ${Number(med.stock_actual) <= Number(med.stock_minimo) ? 'bg-danger' : 'bg-success'}`}>
                          {med.stock_actual}
                        </span>
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => abrirModalEditar(med)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(med.id, med.nombre)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modoEdicion ? '✏️ Editar Medicamento' : '➕ Nuevo Medicamento'}
                </h5>
                <button className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Laboratorio *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.laboratorio}
                        onChange={(e) => setFormData({...formData, laboratorio: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Presentación</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Tabletas 500mg"
                        value={formData.presentacion}
                        onChange={(e) => setFormData({...formData, presentacion: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Unidad de Medida</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: unidades, ml, mg"
                        value={formData.unidad_medida}
                        onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Precio Compra (Q)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.precio_compra}
                        onChange={(e) => setFormData({...formData, precio_compra: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Precio Venta (Q)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.precio_venta}
                        onChange={(e) => setFormData({...formData, precio_venta: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Ganancia (Q)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.ganancia_venta}
                        onChange={(e) => setFormData({...formData, ganancia_venta: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock Actual</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.stock_actual}
                        onChange={(e) => setFormData({...formData, stock_actual: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock Mínimo</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.stock_minimo}
                        onChange={(e) => setFormData({...formData, stock_minimo: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>
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
    </div>
  );
}