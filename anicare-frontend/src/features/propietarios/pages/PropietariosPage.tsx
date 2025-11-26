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
import { 
  obtenerRazasPorEspecie, 
  buscarOCrearRazaPersonalizada,
  type Raza
} from '../../pacientes/services/razaService';
import { obtenerEspecies, type Especie } from '../../pacientes/services/especieService';

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
  castrado?: boolean;
  adoptado?: boolean;
  fecha_adopcion?: string;
  edad_aproximada?: boolean;
  nombre_raza?: string;
  nombre_especie?: string;
}

export default function PropietariosPage() {
  const navigate = useNavigate();
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
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
  const [nombrePropietarioSeleccionado, setNombrePropietarioSeleccionado] = useState<string>('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dpi: '',
    nit: '',
    direccion: '',
    telefono: '',
    correo: ''
  });

  // Estados para el formulario de paciente
  const [formPaciente, setFormPaciente] = useState({
    nombre: '',
    sexo: 'M' as 'M' | 'F',
    color: '',
    fecha_nacimiento: '',
    id_raza: 0,
    castrado: false,
    adoptado: false,
    fecha_adopcion: '',
    edad_aproximada: false
  });

  // Estados para la lógica de especies dinámicas
  const [especieSeleccionada, setEspecieSeleccionada] = useState<number>(1); // 1=Canino por defecto
  const [especiePersonalizada, setEspeciePersonalizada] = useState('');
  const [razaPersonalizada, setRazaPersonalizada] = useState('');
  const [mostrarInputEspecieOtra, setMostrarInputEspecieOtra] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [props, esps] = await Promise.all([
        obtenerPropietarios(),
        obtenerEspecies()
      ]);
      
      // Cargar pacientes para cada propietario
      const propsConPacientes = await Promise.all(
        props.map(async (prop) => {
          const pacientes = await obtenerPacientesPorPropietario(prop.id!);
          return { ...prop, pacientes };
        })
      );
      
      setPropietarios(propsConPacientes);
      setEspecies(esps);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIONES PARA MODAL DE PROPIETARIO
  // ==========================================
  const abrirModalNuevo = () => {
    setFormData({
      nombre: '',
      apellido: '',
      dpi: '',
      nit: '',
      direccion: '',
      telefono: '',
      correo: ''
    });
    setModoEdicion(false);
    setPropietarioEditar(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (propietario: Propietario) => {
    setFormData({
      nombre: propietario.nombre,
      apellido: propietario.apellido,
      dpi: propietario.dpi,
      nit: propietario.nit,
      direccion: propietario.direccion,
      telefono: propietario.telefono,
      correo: propietario.correo
    });
    setModoEdicion(true);
    setPropietarioEditar(propietario);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setPropietarioEditar(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modoEdicion && propietarioEditar?.id) {
        await actualizarPropietario(propietarioEditar.id, formData);
        alert('Propietario actualizado exitosamente');
      } else {
        await crearPropietario(formData);
        alert('Propietario creado exitosamente');
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar propietario:', error);
      alert('Error al guardar el propietario');
    }
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este propietario?')) {
      try {
        await eliminarPropietario(id);
        alert('Propietario eliminado');
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el propietario');
      }
    }
  };

  // ==========================================
  // FUNCIONES PARA MODAL DE PACIENTE
  // ==========================================
  const abrirModalPaciente = (idPropietario: number, nombreCompleto: string) => {
    setPropietarioSeleccionado(idPropietario);
    setNombrePropietarioSeleccionado(nombreCompleto);
    setFormPaciente({
      nombre: '',
      sexo: 'M',
      color: '',
      fecha_nacimiento: '',
      id_raza: 0,
      castrado: false,
      adoptado: false,
      fecha_adopcion: '',
      edad_aproximada: false
    });
    setEspecieSeleccionada(1); // Canino por defecto
    setEspeciePersonalizada('');
    setRazaPersonalizada('');
    setMostrarInputEspecieOtra(false);
    setMostrarModalPaciente(true);
    cargarRazasPorEspecie(1);
  };

  const cerrarModalPaciente = () => {
    setMostrarModalPaciente(false);
    setPropietarioSeleccionado(null);
    setNombrePropietarioSeleccionado('');
  };

  const cargarRazasPorEspecie = async (idEspecie: number) => {
    try {
      const razasObtenidas = await obtenerRazasPorEspecie(idEspecie);
      setRazas(razasObtenidas);
    } catch (error) {
      console.error('Error al cargar razas:', error);
    }
  };

  const handleEspecieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const especieId = Number(e.target.value);
    setEspecieSeleccionada(especieId);
    
    const especieObj = especies.find(esp => esp.id === especieId);
    const esOtra = especieObj?.nombre === 'Otro';
    
    setMostrarInputEspecieOtra(esOtra);
    
    if (esOtra) {
      setRazas([]);
      setFormPaciente(prev => ({ ...prev, id_raza: 0 }));
    } else {
      cargarRazasPorEspecie(especieId);
    }
  };

  const handlePacienteInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormPaciente(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormPaciente(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propietarioSeleccionado) {
      alert('No se ha seleccionado un propietario');
      return;
    }

    try {
      let idRazaFinal = formPaciente.id_raza;

      // Si la especie es "Otro" y se ingresó un nombre personalizado
      if (mostrarInputEspecieOtra && especiePersonalizada.trim()) {
        const razaCreada = await buscarOCrearRazaPersonalizada(
          especiePersonalizada.trim(),
          razaPersonalizada.trim() || especiePersonalizada.trim()
        );
        idRazaFinal = razaCreada.id;
      }

      const pacienteData = {
        ...formPaciente,
        id_raza: idRazaFinal,
        id_propietario: propietarioSeleccionado,
        fecha_adopcion: formPaciente.adoptado ? formPaciente.fecha_adopcion : null
      };

      await crearPaciente(pacienteData);
      alert('Paciente creado exitosamente');
      cerrarModalPaciente();
      cargarDatos();
    } catch (error) {
      console.error('Error al crear paciente:', error);
      alert('Error al crear el paciente');
    }
  };

  // ==========================================
  // FILTRADO Y RENDERIZADO
  // ==========================================
  const propietariosFiltrados = propietarios.filter(prop => {
    const textoBusqueda = busqueda.toLowerCase();
    return (
      prop.nombre.toLowerCase().includes(textoBusqueda) ||
      prop.apellido.toLowerCase().includes(textoBusqueda) ||
      prop.dpi.toLowerCase().includes(textoBusqueda) ||
      prop.telefono.toLowerCase().includes(textoBusqueda) ||
      prop.correo.toLowerCase().includes(textoBusqueda)
    );
  });

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
      {/* ========== HEADER - IGUAL A PACIENTES ========== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary mb-1">
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
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Propietario
          </button>
        </div>
      </div>

      {/* ========== BARRA DE BÚSQUEDA - IGUAL A PACIENTES ========== */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, DPI, teléfono o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ========== TABLA - IGUAL A PACIENTES ========== */}
      {propietariosFiltrados.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No se encontraron propietarios.
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4">#</th>
                    <th>Nombre</th>
                    <th>DPI</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Pacientes</th>
                    <th className="text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {propietariosFiltrados.map((prop, index) => (
                    <tr key={prop.id}>
                      <td className="px-4">{index + 1}</td>
                      <td>
                        <strong>{prop.nombre} {prop.apellido}</strong>
                      </td>
                      <td>{prop.dpi}</td>
                      <td>{prop.telefono}</td>
                      <td>{prop.correo}</td>
                      <td>
                        {prop.pacientes && prop.pacientes.length > 0 ? (
                          <div>
                          <ul className="list-unstyled mb-0">
                            {prop.pacientes.map(pac => (
                              <li key={pac.id}>
                                <i className="bi bi-circle-fill text-primary me-2" style={{ fontSize: '0.5rem' }}></i>
                                    <span key={pac.id} className="badge bg-info me-1">
                                {pac.nombre} ({pac.nombre_especie})
                              </span>
                                      <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => navigate(`/paciente/${pac.id}/historial`)}
                              >
                                <i className="bi bi-file-medical-fill"></i> Historial
                              </button>
                              </li>
                            ))}
                          </ul>
                          
                          </div>
                        ) : (
                          <span className="text-muted">Sin pacientes</span>
                        )}
                      </td>
                      <td className="text-end px-4">
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => abrirModalPaciente(prop.id!, `${prop.nombre} ${prop.apellido}`)}
                          title="Agregar paciente"
                        >
                          <i className="bi bi-plus-circle"></i> Agregar paciente
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => abrirModalEditar(prop)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(prop.id!)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i> Eliminar
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

      {/* ========================================== */}
      {/* MODAL PROPIETARIO - IGUAL A PACIENTES */}
      {/* ========================================== */}
      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-fill me-2"></i>
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
                        type="tel"
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
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>
                    {modoEdicion ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL NUEVO PACIENTE - EXACTO A PACIENTES */}
      {/* CON PROPIETARIO PRESELECCIONADO */}
      {/* ========================================== */}
      {mostrarModalPaciente && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-heart-pulse-fill me-2"></i>
                  Nuevo Paciente
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModalPaciente}></button>
              </div>
              <form onSubmit={handleSubmitPaciente}>
                <div className="modal-body">
                  {/* Alerta con propietario preseleccionado */}
                  <div className="alert alert-info d-flex align-items-center">
                    <i className="bi bi-info-circle me-2"></i>
                    <div>
                      <strong>Propietario:</strong> {nombrePropietarioSeleccionado}
                    </div>
                  </div>

                  {/* Nombre del Paciente */}
                  <div className="mb-3">
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

                  {/* Especie */}
                  <div className="mb-3">
                    <label className="form-label">Especie *</label>
                    <select
                      className="form-select"
                      value={especieSeleccionada}
                      onChange={handleEspecieChange}
                      required
                    >
                      {especies.map((esp) => (
                        <option key={esp.id} value={esp.id}>
                          {esp.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input para especie personalizada */}
                  {mostrarInputEspecieOtra && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Nombre de la Especie *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ej: Reptil, Ave, etc."
                          value={especiePersonalizada}
                          onChange={(e) => setEspeciePersonalizada(e.target.value)}
                          required
                        />
                        <small className="text-muted">
                          Se creará automáticamente una nueva especie y raza con este nombre
                        </small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Nombre de la Raza (opcional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ej: Iguana, Loro, etc. (si no se especifica, se usa el nombre de la especie)"
                          value={razaPersonalizada}
                          onChange={(e) => setRazaPersonalizada(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* Raza (solo si no es "Otro") */}
                  {!mostrarInputEspecieOtra && (
                    <div className="mb-3">
                      <label className="form-label">Raza *</label>
                      <select
                        className="form-select"
                        name="id_raza"
                        value={formPaciente.id_raza}
                        onChange={handlePacienteInputChange}
                        required
                      >
                        <option value="">Seleccione una raza</option>
                        {razas.map((raza) => (
                          <option key={raza.id} value={raza.id}>
                            {raza.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Sexo y Castrado */}
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
                      <label className="form-label">Castrado</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="castrado"
                          checked={formPaciente.castrado}
                          onChange={handlePacienteInputChange}
                        />
                        <label className="form-check-label">
                          {formPaciente.castrado ? 'Sí' : 'No'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Fecha de Nacimiento y Edad Aproximada */}
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Fecha de Nacimiento *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="fecha_nacimiento"
                        value={formPaciente.fecha_nacimiento}
                        onChange={handlePacienteInputChange}
                        required
                      />
                    <div className="form-check mt-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="edadAproximada"
                          name="edad_aproximada"
                        checked={formPaciente.edad_aproximada}
                        onChange={handlePacienteInputChange}
                      />
                      <label className="form-check-label" htmlFor="edadAproximada">
                        <small className="text-muted">
                          La fecha de nacimiento es aproximada (no se conoce con exactitud)
                        </small>
                      </label>
                    </div>
                    </div>
                  </div>

                  {/* Adoptado */}
                  <div className="mb-3">
                    <label className="form-label">Adoptado</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="adoptado"
                        checked={formPaciente.adoptado}
                        onChange={handlePacienteInputChange}
                      />
                      <label className="form-check-label">
                        {formPaciente.adoptado ? 'Sí' : 'No'}
                      </label>
                    </div>
                  </div>

                  {/* Fecha de Adopción (solo si adoptado = true) */}
                  {formPaciente.adoptado && (
                    <div className="mb-3">
                      <label className="form-label">Fecha de Adopción</label>
                      <input
                        type="date"
                        className="form-control"
                        name="fecha_adopcion"
                        value={formPaciente.fecha_adopcion}
                        onChange={handlePacienteInputChange}
                      />
                    </div>
                  )}

                  {/* Color del Manto */}
                  <div className="mb-3">
                    <label className="form-label">Color del Manto *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="color"
                      placeholder="Ej: Blanco, Negro, Café, etc."
                      value={formPaciente.color}
                      onChange={handlePacienteInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalPaciente}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>
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