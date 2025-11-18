// anicare-frontend/src/features/propietarios/pages/PropietariosPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPropietarios, crearPropietario, actualizarPropietario, eliminarPropietario } from '../services/propietarioService';

interface Propietario {
  id?: number;
  nombre: string;
  apellido: string;
  dpi: string;
  nit: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export default function PropietariosPage() {
  const navigate = useNavigate();
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [propietarioEditar, setPropietarioEditar] = useState<Propietario | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dpi: '',
    nit: '',
    direccion: '',
    telefono: '',
    correo: ''
  });

  useEffect(() => {
    cargarPropietarios();
  }, []);

  const cargarPropietarios = async () => {
    try {
      setLoading(true);
      const data = await obtenerPropietarios();
      setPropietarios(data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar propietarios');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setPropietarioEditar(null);
    setFormData({
      nombre: '',
      apellido: '',
      dpi: '',
      nit: '',
      direccion: '',
      telefono: '',
      correo: ''
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (prop: Propietario) => {
    setModoEdicion(true);
    setPropietarioEditar(prop);
    setFormData({
      nombre: prop.nombre,
      apellido: prop.apellido,
      dpi: prop.dpi,
      nit: prop.nit,
      direccion: prop.direccion,
      telefono: prop.telefono,
      correo: prop.correo
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormData({
      nombre: '',
      apellido: '',
      dpi: '',
      nit: '',
      direccion: '',
      telefono: '',
      correo: ''
    });
    setPropietarioEditar(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      alert('El nombre y apellido son obligatorios');
      return;
    }

    try {
      if (modoEdicion && propietarioEditar) {
        await actualizarPropietario(propietarioEditar.id!, formData);
        alert('Propietario actualizado exitosamente');
      } else {
        await crearPropietario(formData);
        alert('Propietario creado exitosamente');
      }
      cerrarModal();
      cargarPropietarios();
    } catch (error) {
      console.error(error);
      alert('Error al guardar propietario');
    }
  };

  const handleEliminar = async (id: number, nombre: string, apellido: string) => {
    if (!confirm(`¿Estás seguro de eliminar al propietario "${nombre} ${apellido}"?`)) return;

    try {
      await eliminarPropietario(id);
      alert('Propietario eliminado exitosamente');
      cargarPropietarios();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar propietario');
    }
  };

  const propietariosFiltrados = propietarios.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.dpi.includes(busqueda) ||
    p.telefono.includes(busqueda)
  );

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando propietarios...</p>
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
            <i className="bi bi-person-lines-fill me-2"></i>
            Propietarios
          </h3>
          <p className="text-muted mb-0">
            {propietarios.length} propietario{propietarios.length !== 1 ? 's' : ''} registrado{propietarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Dashboard
          </button>
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Propietario
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
              placeholder="Buscar por nombre, DPI o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Propietarios */}
      {propietariosFiltrados.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay propietarios registrados{busqueda && ' que coincidan con la búsqueda'}.
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Nombre Completo</th>
                    <th>DPI</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Dirección</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {propietariosFiltrados.map((prop, index) => (
                    <tr key={prop.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{prop.nombre} {prop.apellido}</strong>
                      </td>
                      <td>{prop.dpi}</td>
                      <td>{prop.telefono}</td>
                      <td>{prop.correo}</td>
                      <td>{prop.direccion}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => abrirModalEditar(prop)}
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(prop.id!, prop.nombre, prop.apellido)}
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modoEdicion ? 'Editar Propietario' : 'Nuevo Propietario'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
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
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellido *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">DPI </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dpi}
                        onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
               
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">NIT</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nit}
                        onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Teléfono *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Correo *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.correo}
                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dirección *</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      required
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