// anicare-frontend/src/features/propietarios/pages/PropietariosPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  obtenerPropietarios, 
  crearPropietario, 
  actualizarPropietario, 
  eliminarPropietario,
  obtenerPacientesPorPropietario 
} from '../services/propietarioService';
import { crearPaciente } from '../../pacientes/services/pacienteService';
import { obtenerRazas } from '../../pacientes/services/razaService';

interface Propietario {
  id?: number;
  nombre: string;
  apellido: string;
  dpi: string;
  nit: string;
  direccion: string;
  telefono: string;
  correo: string;
  pacientes?: Paciente[];
}

interface Paciente {
  id: number;
  nombre: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  color: string;
  nombre_raza?: string;
  nombre_especie?: string;
}

interface Raza {
  id: number;
  nombre: string;
}

export default function PropietariosPage() {
  const navigate = useNavigate();
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [razas, setRazas] = useState<Raza[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Estados para modal de propietario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [propietarioEditar, setPropietarioEditar] = useState<Propietario | null>(null);

  // Estados para modal de paciente
  const [mostrarModalPaciente, setMostrarModalPaciente] = useState(false);
  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dpi: '',
    nit: '',
    direccion: '',
    telefono: '',
    correo: ''
  });

  const [formPaciente, setFormPaciente] = useState({
    nombre: '',
    sexo: 'M' as 'M' | 'F',
    color: '',
    fecha_nacimiento: '',
    id_raza: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [props, razs] = await Promise.all([
        obtenerPropietarios(),
        obtenerRazas()
      ]);
      
      // Cargar pacientes para cada propietario
      const propsConPacientes = await Promise.all(
        props.map(async (prop) => {
          const pacientes = await obtenerPacientesPorPropietario(prop.id!);
          return { ...prop, pacientes };
        })
      );
      
      setPropietarios(propsConPacientes);
      setRazas(razs);
    } catch (error) {
      console.error(error);
      alert('Error al cargar datos');
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modoEdicion && propietarioEditar) {
        await actualizarPropietario(propietarioEditar.id!, formData);
        alert('Propietario actualizado exitosamente');
      } else {
        await crearPropietario(formData);
        alert('Propietario creado exitosamente');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al guardar propietario');
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar al propietario ${nombre}?`)) {
      return;
    }

    try {
      await eliminarPropietario(id);
      alert('Propietario eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar propietario');
    }
  };

  // Funciones para modal de paciente
  const abrirModalAgregarPaciente = (idPropietario: number) => {
    setPropietarioSeleccionado(idPropietario);
    setFormPaciente({
      nombre: '',
      sexo: 'M',
      color: '',
      fecha_nacimiento: '',
      id_raza: 0
    });
    setMostrarModalPaciente(true);
  };

  const cerrarModalPaciente = () => {
    setMostrarModalPaciente(false);
    setPropietarioSeleccionado(null);
  };

  const handlePacienteInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormPaciente(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formPaciente.nombre || !formPaciente.fecha_nacimiento || !formPaciente.id_raza) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      await crearPaciente({
        ...formPaciente,
        id_propietario: propietarioSeleccionado!,
        id_raza: parseInt(formPaciente.id_raza.toString())
      });

      alert('Paciente agregado exitosamente');
      cerrarModalPaciente();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert('Error al agregar paciente');
    }
  };

  const propietariosFiltrados = propietarios.filter(prop =>
    prop.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    prop.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    prop.dpi.includes(busqueda) ||
    prop.telefono.includes(busqueda)
  );

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
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
          <h3 className="text-success mb-1">
            <i className="bi bi-people-fill me-2"></i>
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
          <button className="btn btn-success" onClick={abrirModalNuevo}>
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
              placeholder="Buscar por nombre, apellido, DPI o teléfono..."
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
                    <th>Nombre</th>
                    <th>DPI</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Paciente(s)</th>
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
                      <td>
                        {/* Columna de Pacientes */}
                        {prop.pacientes && prop.pacientes.length > 0 ? (
                          prop.pacientes.map((pac) => (
                            <div key={pac.id} className="mb-1">
                              <span className="me-2">{pac.nombre}</span>
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => navigate(`/paciente/${pac.id}/historial`)}
                              >
                                <i className="bi bi-file-medical-fill"></i> Historial
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted fst-italic">Sin pacientes</span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => abrirModalAgregarPaciente(prop.id!)}
                        >
                          <i className="bi bi-plus-circle-fill"></i> Agregar paciente
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => abrirModalEditar(prop)}
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(prop.id!, `${prop.nombre} ${prop.apellido}`)}
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

      {/* Modal para Crear/Editar Propietario */}
      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modoEdicion ? (
                    <>
                      <i className="bi bi-pencil-fill me-2"></i>
                      Editar Propietario
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Nuevo Propietario
                    </>
                  )}
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
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellido *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">DPI *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="dpi"
                        value={formData.dpi}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">NIT *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nit"
                        value={formData.nit}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Dirección *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Teléfono *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Correo *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-check-circle me-2"></i>
                    {modoEdicion ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar paciente */}
      {mostrarModalPaciente && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Agregar Paciente
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModalPaciente}></button>
              </div>
              <form onSubmit={handleSubmitPaciente}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>
                      <strong>Propietario:</strong>{' '}
                      {propietarios.find(p => p.id === propietarioSeleccionado)?.nombre}{' '}
                      {propietarios.find(p => p.id === propietarioSeleccionado)?.apellido}
                    </small>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre del Paciente *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={formPaciente.nombre}
                        onChange={handlePacienteInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Raza *</label>
                      <select
                        className="form-select"
                        name="id_raza"
                        value={formPaciente.id_raza}
                        onChange={handlePacienteInputChange}
                        required
                      >
                        <option value={0}>Seleccione una raza</option>
                        {razas.map(r => (
                          <option key={r.id} value={r.id}>{r.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Sexo *</label>
                      <select
                        className="form-select"
                        name="sexo"
                        value={formPaciente.sexo}
                        onChange={handlePacienteInputChange}
                        required
                      >
                        <option value="M">Macho</option>
                        <option value="F">Hembra</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha de Nacimiento *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="fecha_nacimiento"
                        value={formPaciente.fecha_nacimiento}
                        onChange={handlePacienteInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Color</label>
                    <input
                      type="text"
                      className="form-control"
                      name="color"
                      value={formPaciente.color}
                      onChange={handlePacienteInputChange}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalPaciente}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Guardar Paciente
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