// anicare-frontend/src/features/pacientes/pages/PacientesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPacientes, crearPaciente, actualizarPaciente, eliminarPaciente } from '../services/pacienteService';
import { obtenerRazas } from '../services/razaService';
import { obtenerPropietarios } from '../services/propietarioService';

interface Paciente {
  id?: number;
  id_propietario: number;
  id_raza: number;
  nombre: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  color: string;
  nombre_propietario?: string;
  nombre_raza?: string;
}

interface Raza {
  id: number;
  nombre: string;
}

interface Propietario {
  id: number;
  nombre: string;
  apellido: string;
}

export default function PacientesPage() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [razas, setRazas] = useState<Raza[]>([]);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [pacienteEditar, setPacienteEditar] = useState<Paciente | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    sexo: 'M' as 'M' | 'F',
    color: '',
    fecha_nacimiento: '',
    id_raza: 0,
    id_propietario: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [pac, props, raz] = await Promise.all([
        obtenerPacientes(),
        obtenerPropietarios(),
        obtenerRazas()
      ]);
      setPacientes(pac);
      setPropietarios(props);
      setRazas(raz);
    } catch (error) {
      console.error(error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setPacienteEditar(null);
    setFormData({
      nombre: '',
      sexo: 'M',
      color: '',
      fecha_nacimiento: '',
      id_raza: razas[0]?.id || 0,
      id_propietario: propietarios[0]?.id || 0
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (paciente: Paciente) => {
    setModoEdicion(true);
    setPacienteEditar(paciente);
    setFormData({
      nombre: paciente.nombre,
      sexo: paciente.sexo,
      color: paciente.color,
      fecha_nacimiento: paciente.fecha_nacimiento,
      id_raza: paciente.id_raza,
      id_propietario: paciente.id_propietario
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormData({
      nombre: '',
      sexo: 'M',
      color: '',
      fecha_nacimiento: '',
      id_raza: 0,
      id_propietario: 0
    });
    setPacienteEditar(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.id_raza || !formData.id_propietario) {
      alert('El nombre, raza y propietario son obligatorios');
      return;
    }

    try {
      if (modoEdicion && pacienteEditar) {
        await actualizarPaciente(pacienteEditar.id!, formData);
        alert('Paciente actualizado exitosamente');
      } else {
        await crearPaciente(formData);
        alert('Paciente creado exitosamente');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar paciente');
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar al paciente "${nombre}"?`)) return;

    try {
      await eliminarPaciente(id);
      alert('Paciente eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar paciente');
    }
  };

  const pacientesFiltrados = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nombre_propietario?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const obtenerNombreRaza = (id: number) => {
    const raza = razas.find(r => r.id === id);
    return raza?.nombre || `ID: ${id}`;
  };

  const obtenerNombrePropietario = (id: number) => {
    const prop = propietarios.find(p => p.id === id);
    return prop ? `${prop.nombre} ${prop.apellido}` : `ID: ${id}`;
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando pacientes...</p>
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
            <i className="bi bi-heart-pulse me-2"></i>
            Pacientes
          </h3>
          <p className="text-muted mb-0">
            {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} registrado{pacientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Dashboard
          </button>
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Paciente
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
              placeholder="Buscar por nombre o propietario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Pacientes */}
      {pacientesFiltrados.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay pacientes registrados{busqueda && ' que coincidan con la búsqueda'}.
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
                    <th>Sexo</th>
                    <th>Color</th>
                    <th>Fecha Nac.</th>
                    <th>Raza</th>
                    <th>Propietario</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map((pac, index) => (
                    <tr key={pac.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{pac.nombre}</strong>
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {pac.sexo === 'M' ? 'Macho' : 'Hembra'}
                        </span>
                      </td>
                      <td>{pac.color}</td>
                      <td>{new Date(pac.fecha_nacimiento).toLocaleDateString('es-GT')}</td>
                      <td>{pac.nombre_raza || obtenerNombreRaza(pac.id_raza)}</td>
                      <td>{pac.nombre_propietario || obtenerNombrePropietario(pac.id_propietario)}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => abrirModalEditar(pac)}
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger me-2"
                          onClick={() => handleEliminar(pac.id!, pac.nombre)}
                        >
                          <i className="bi bi-trash-fill"></i> Eliminar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => navigate(`/paciente/${pac.id}/historial`)}
                        >
                          <i className="bi bi-file-medical-fill"></i> Historial
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
                  {modoEdicion ? 'Editar Paciente' : 'Nuevo Paciente'}
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
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Sexo *</label>
                      <select
                        className="form-select"
                        value={formData.sexo}
                        onChange={(e) => setFormData({ ...formData, sexo: e.target.value as 'M' | 'F' })}
                        required
                      >
                        <option value="M">Macho</option>
                        <option value="F">Hembra</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Color *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fecha_nacimiento}
                      onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Raza *</label>
                    <select
                      className="form-select"
                      value={formData.id_raza}
                      onChange={(e) => setFormData({ ...formData, id_raza: parseInt(e.target.value) })}
                      required
                    >
                      <option value={0}>Seleccionar raza</option>
                      {razas.map(raza => (
                        <option key={raza.id} value={raza.id}>{raza.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Propietario *</label>
                    <select
                      className="form-select"
                      value={formData.id_propietario}
                      onChange={(e) => setFormData({ ...formData, id_propietario: parseInt(e.target.value) })}
                      required
                    >
                      <option value={0}>Seleccionar propietario</option>
                      {propietarios.map(prop => (
                        <option key={prop.id} value={prop.id}>
                          {prop.nombre} {prop.apellido}
                        </option>
                      ))}
                    </select>
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