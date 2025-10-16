// anicare-frontend/src/features/razas/pages/RazasPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerRazas, crearRaza, actualizarRaza, eliminarRaza } from '../services/razaService';
import { obtenerEspecies } from '../../especies/services/especieService';

import type { Especie } from '../../especies/services/especieService'; // ✅ CORREGIDO: import type
import type { Raza } from '../services/razaService'; // ✅ CORREGIDO: import type


export default function RazasPage() {
  const navigate = useNavigate();
  const [razas, setRazas] = useState<Raza[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [razaEditar, setRazaEditar] = useState<Raza | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    id_especie: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [razasData, especiesData] = await Promise.all([
        obtenerRazas(),
        obtenerEspecies()
      ]);
      setRazas(razasData);
      setEspecies(especiesData);
    } catch (error) {
      console.error(error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setRazaEditar(null);
    setFormData({ nombre: '', descripcion: '', id_especie: especies[0]?.id || 0 });
    setMostrarModal(true);
  };

  const abrirModalEditar = (raza: Raza) => {
    setModoEdicion(true);
    setRazaEditar(raza);
    setFormData({
      nombre: raza.nombre,
      descripcion: raza.descripcion,
      id_especie: raza.id_especie
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormData({ nombre: '', descripcion: '', id_especie: 0 });
    setRazaEditar(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.id_especie) {
      alert('El nombre y la especie son obligatorios');
      return;
    }

    try {
      if (modoEdicion && razaEditar) {
        await actualizarRaza(razaEditar.id!, formData);
        alert('Raza actualizada exitosamente');
      } else {
        await crearRaza(formData);
        alert('Raza creada exitosamente');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar raza');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta raza?')) return;

    try {
      await eliminarRaza(id);
      alert('Raza eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar raza');
    }
  };

  const razasFiltradas = razas.filter(r => {
    const matchBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchEspecie = !filtroEspecie || r.id_especie.toString() === filtroEspecie;
    return matchBusqueda && matchEspecie;
  });

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando razas...</p>
        </div>
      </div>
    );
  }

  // Continuación de RazasPage.tsx

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary mb-1">
            <i className="bi bi-list-stars me-2"></i>
            Razas
          </h3>
          <p className="text-muted mb-0">
            {razas.length} raza{razas.length !== 1 ? 's' : ''} registrada{razas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Dashboard
          </button>
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Raza
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
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
            <div className="col-md-4">
              <select
                className="form-select"
                value={filtroEspecie}
                onChange={(e) => setFiltroEspecie(e.target.value)}
              >
                <option value="">Todas las especies</option>
                {especies.map(esp => (
                  <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Razas */}
      {razasFiltradas.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay razas registradas{(busqueda || filtroEspecie) && ' que coincidan con los filtros'}.
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
                    <th>Especie</th>
                    <th>Descripción</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {razasFiltradas.map((raza, index) => (
                    <tr key={raza.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{raza.nombre}</strong>
                      </td>
                      <td>
                        <span className="badge bg-primary">{raza.nombre_especie}</span>
                      </td>
                      <td>{raza.descripcion}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => abrirModalEditar(raza)}
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(raza.id!)}
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
                  {modoEdicion ? 'Editar Raza' : 'Nueva Raza'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Especie *</label>
                    <select
                      className="form-select"
                      value={formData.id_especie}
                      onChange={(e) => setFormData({ ...formData, id_especie: parseInt(e.target.value) })}
                      required
                    >
                      <option value={0}>Seleccionar especie</option>
                      {especies.map(esp => (
                        <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                      ))}
                    </select>
                  </div>
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