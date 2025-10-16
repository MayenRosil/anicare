// anicare-frontend/src/features/especies/pages/EspeciesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerEspecies, crearEspecie, actualizarEspecie, eliminarEspecie } from '../services/especieService';
import type { Especie } from '../services/especieService'; // ✅ CORREGIDO: import type


export default function EspeciesPage() {
  const navigate = useNavigate();
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [especieEditar, setEspecieEditar] = useState<Especie | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarEspecies();
  }, []);

  const cargarEspecies = async () => {
    try {
      setLoading(true);
      const data = await obtenerEspecies();
      setEspecies(data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar especies');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setEspecieEditar(null);
    setFormData({ nombre: '', descripcion: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (especie: Especie) => {
    setModoEdicion(true);
    setEspecieEditar(especie);
    setFormData({
      nombre: especie.nombre,
      descripcion: especie.descripcion
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormData({ nombre: '', descripcion: '' });
    setEspecieEditar(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      if (modoEdicion && especieEditar) {
        await actualizarEspecie(especieEditar.id!, formData);
        alert('Especie actualizada exitosamente');
      } else {
        await crearEspecie(formData);
        alert('Especie creada exitosamente');
      }
      cerrarModal();
      cargarEspecies();
    } catch (error) {
      console.error(error);
      alert('Error al guardar especie');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta especie?')) return;

    try {
      await eliminarEspecie(id);
      alert('Especie eliminada exitosamente');
      cargarEspecies();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar especie');
    }
  };

  const especiesFiltradas = especies.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando especies...</p>
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
            <i className="bi bi-bookmarks-fill me-2"></i>
            Especies
          </h3>
          <p className="text-muted mb-0">
            {especies.length} especie{especies.length !== 1 ? 's' : ''} registrada{especies.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Dashboard
          </button>
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Especie
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
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Especies */}
      {especiesFiltradas.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay especies registradas{busqueda && ' que coincidan con la búsqueda'}.
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
                    <th>Descripción</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {especiesFiltradas.map((especie, index) => (
                    <tr key={especie.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{especie.nombre}</strong>
                      </td>
                      <td>{especie.descripcion}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => abrirModalEditar(especie)}
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(especie.id!)}
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

      {/* Modal para Crear/Editar */}
      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modoEdicion ? 'Editar Especie' : 'Nueva Especie'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    ></textarea>
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
    </div>
  );
}