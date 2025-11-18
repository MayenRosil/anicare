// anicare-frontend/src/features/doctores/pages/DoctoresPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerDoctores, crearDoctor, actualizarDoctor, eliminarDoctor } from '../services/doctorService';
import type { Doctor } from '../services/doctorService';

export default function DoctoresPage() {
  const navigate = useNavigate();
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [doctorEditar, setDoctorEditar] = useState<Doctor | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    especialidad: '',
    dpi: '',
    telefono: '',
    correo: '',
    colegiado: '',
    activo: true
  });

  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      setLoading(true);
      const data = await obtenerDoctores();
      setDoctores(data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar doctores');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setDoctorEditar(null);
    setFormData({
      nombre: '',
      apellido: '',
      especialidad: '',
      dpi: '',
      telefono: '',
      correo: '',
      colegiado: '',
      activo: true
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (doctor: Doctor) => {
    setModoEdicion(true);
    setDoctorEditar(doctor);
    setFormData({
      nombre: doctor.nombre,
      apellido: doctor.apellido,
      especialidad: doctor.especialidad,
      dpi: doctor.dpi,
      telefono: doctor.telefono,
      correo: doctor.correo,
      colegiado: doctor.colegiado,
      activo: doctor.activo ?? true
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormData({
      nombre: '',
      apellido: '',
      especialidad: '',
      dpi: '',
      telefono: '',
      correo: '',
      colegiado: '',
      activo: true
    });
    setDoctorEditar(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      alert('El nombre y apellido son obligatorios');
      return;
    }

    if (!formData.correo.trim() || !formData.correo.includes('@')) {
      alert('El correo electrónico es obligatorio y debe ser válido');
      return;
    }

    if (!formData.dpi.trim() || formData.dpi.length < 13) {
      alert('El DPI debe tener al menos 13 dígitos');
      return;
    }

    try {
      if (modoEdicion && doctorEditar) {
        await actualizarDoctor(doctorEditar.id!, formData);
        alert('Doctor actualizado exitosamente');
      } else {
        await crearDoctor(formData);
        alert('Doctor creado exitosamente');
      }
      cerrarModal();
      cargarDoctores();
    } catch (error) {
      console.error(error);
      alert('Error al guardar doctor');
    }
  };

  const handleEliminar = async (id: number, nombreCompleto: string) => {
    if (!confirm(`¿Estás seguro de eliminar al doctor ${nombreCompleto}?`)) return;

    try {
      await eliminarDoctor(id);
      alert('Doctor eliminado exitosamente');
      cargarDoctores();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar doctor');
    }
  };

  const doctoresFiltrados = doctores.filter(d => {
    const nombreCompleto = `${d.nombre} ${d.apellido}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase()) ||
           d.especialidad.toLowerCase().includes(busqueda.toLowerCase());
  });

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando doctores...</p>
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
            <i className="bi bi-person-badge-fill me-2"></i>
            Doctores
          </h3>
          <p className="text-muted mb-0">
            {doctores.length} doctor{doctores.length !== 1 ? 'es' : ''} registrado{doctores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Dashboard
          </button>
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Doctor
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
              placeholder="Buscar por nombre o especialidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Doctores */}
      {doctoresFiltrados.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay doctores registrados{busqueda && ' que coincidan con la búsqueda'}.
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
                    <th>Especialidad</th>
                    <th>DPI</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {doctoresFiltrados.map((doctor, index) => (
                    <tr key={doctor.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{doctor.nombre} {doctor.apellido}</strong>
                      </td>
                      <td>
                        <span className="badge bg-info">{doctor.especialidad}</span>
                      </td>
                      <td>{doctor.dpi}</td>
                      <td>
                        <i className="bi bi-telephone-fill me-1"></i>
                        {doctor.telefono}
                      </td>
                      <td>
                        <i className="bi bi-envelope-fill me-1"></i>
                        {doctor.correo}
                      </td>
                      <td>
                        {doctor.activo ? (
                          <span className="badge bg-success">Activo</span>
                        ) : (
                          <span className="badge bg-secondary">Inactivo</span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => abrirModalEditar(doctor)}
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(doctor.id!, `${doctor.nombre} ${doctor.apellido}`)}
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
                  <i className="bi bi-person-badge-fill me-2"></i>
                  {modoEdicion ? 'Editar Doctor' : 'Nuevo Doctor'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    {/* Nombre */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        placeholder="Ej: Juan"
                      />
                    </div>

                    {/* Apellido */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        required
                        placeholder="Ej: Pérez"
                      />
                    </div>

                    {/* Especialidad */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Especialidad *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.especialidad}
                        onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                        required
                        placeholder="Ej: Medicina Veterinaria General"
                      />
                    </div>

                    {/* DPI */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        DPI *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.dpi}
                        onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
                        required
                        placeholder="Ej: 1234567890101"
                        maxLength={13}
                      />
                      <small className="text-muted">13 dígitos</small>
                    </div>

                                        {/* DPI */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Colegiado *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.colegiado}
                        onChange={(e) => setFormData({ ...formData, colegiado: e.target.value })}
                        required
                        placeholder="Ej: 123456789"
                        maxLength={20}
                      />
                    </div>

                    {/* Teléfono */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        required
                        placeholder="Ej: 12345678"
                      />
                    </div>

                    {/* Correo */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.correo}
                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                        required
                        placeholder="Ej: doctor@anicare.com"
                      />
                    </div>

                    {/* Estado (solo en modo edición) */}
                    {modoEdicion && (
                      <div className="col-md-12 mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="activoSwitch"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                          />
                          <label className="form-check-label" htmlFor="activoSwitch">
                            Doctor activo
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>
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
