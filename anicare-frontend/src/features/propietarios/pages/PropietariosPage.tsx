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

      // Cargar razas caninas por defecto
      const razasCaninas = await obtenerRazasPorEspecie(1);
      setRazas(razasCaninas);
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
  const abrirModalAgregarPaciente = async (idPropietario: number) => {
    setPropietarioSeleccionado(idPropietario);
    
    // Resetear estados
    setEspecieSeleccionada(1); // Canino por defecto
    setEspeciePersonalizada('');
    setRazaPersonalizada('');
    setMostrarInputEspecieOtra(false);
    
    // Cargar razas caninas por defecto
    const razasCaninas = await obtenerRazasPorEspecie(1);
    setRazas(razasCaninas);
    
    setFormPaciente({
      nombre: '',
      sexo: 'M',
      color: '',
      fecha_nacimiento: '',
      id_raza: razasCaninas[0]?.id || 0,
      castrado: false,
      adoptado: false,
      fecha_adopcion: '',
      edad_aproximada: false
    });
    
    setMostrarModalPaciente(true);
  };

  const cerrarModalPaciente = () => {
    setMostrarModalPaciente(false);
    setPropietarioSeleccionado(null);
  };

  const handlePacienteInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormPaciente(prev => ({ ...prev, [name]: checked }));
      
      // Si desactiva "adoptado", limpiar fecha de adopción
      if (name === 'adoptado' && !checked) {
        setFormPaciente(prev => ({ ...prev, fecha_adopcion: '' }));
      }
    } else {
      setFormPaciente(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejar cambio de especie
  const handleEspecieChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const especieId = parseInt(e.target.value);
    setEspecieSeleccionada(especieId);
    
    if (especieId === 3) {
      // Especie "Otro" - mostrar input personalizado
      setMostrarInputEspecieOtra(true);
      setRazas([]);
    } else {
      // Canino o Felino - cargar razas correspondientes
      setMostrarInputEspecieOtra(false);
      setEspeciePersonalizada('');
      const razasDeEspecie = await obtenerRazasPorEspecie(especieId);
      setRazas(razasDeEspecie);
      setFormPaciente(prev => ({ 
        ...prev, 
        id_raza: razasDeEspecie[0]?.id || 0 
      }));
    }
  };

  const handleSubmitPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formPaciente.nombre || !formPaciente.fecha_nacimiento) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Si está adoptado, validar fecha de adopción
    if (formPaciente.adoptado && !formPaciente.fecha_adopcion) {
      alert('Por favor ingresa la fecha de adopción');
      return;
    }

    try {
      let idRazaFinal = formPaciente.id_raza;

      // Si es especie "Otro", crear especie y raza personalizada
      if (especieSeleccionada === 3) {
        if (!especiePersonalizada.trim() || !razaPersonalizada.trim()) {
          alert('Por favor ingresa el nombre de la especie y la raza');
          return;
        }

        const result = await buscarOCrearRazaPersonalizada(
          razaPersonalizada,
          especiePersonalizada
        );
        idRazaFinal = result.id;
      }

      // Crear el paciente
      await crearPaciente({
        ...formPaciente,
        id_raza: idRazaFinal,
        id_propietario: propietarioSeleccionado!
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
    `${prop.nombre} ${prop.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-people-fill me-2"></i>
            Propietarios
          </h2>
        </div>
      </div>

      {/* Barra de búsqueda y botón */}
      <div className="row mb-3">
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
        <div className="col-md-4 text-end">
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <i className="bi bi-plus-circle-fill me-2"></i>
            Nuevo Propietario
          </button>
        </div>
      </div>

      {/* Tabla de propietarios */}
      {propietarios.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay propietarios registrados
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>DPI</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Pacientes</th>
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
                        {prop.pacientes && prop.pacientes.length > 0 ? (
                          <ul className="list-unstyled mb-0">
                            {prop.pacientes.map(pac => (
                              <li key={pac.id}>
                                <i className="bi bi-circle-fill text-primary me-2" style={{ fontSize: '0.5rem' }}></i>
                                {pac.nombre} ({pac.nombre_especie})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted">Sin pacientes</span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-success me-2 mb-1"
                          onClick={() => abrirModalAgregarPaciente(prop.id!)}
                        >
                          <i className="bi bi-plus-circle-fill"></i> Agregar paciente
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary me-2 mb-1"
                          onClick={() => abrirModalEditar(prop)}
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger mb-1"
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
                        maxLength={13}
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
                        required
                      />
                    </div>
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

      {/* 🎨 Modal NUEVO PACIENTE - DISEÑO EXACTO A PacientesPage */}
      {mostrarModalPaciente && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Paciente</h5>
                <button type="button" className="btn-close" onClick={cerrarModalPaciente}></button>
              </div>
              <form onSubmit={handleSubmitPaciente}>
                <div className="modal-body">
                  {/* Alerta con propietario preseleccionado */}
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>
                      <strong>Propietario:</strong>{' '}
                      {propietarios.find(p => p.id === propietarioSeleccionado)?.nombre}{' '}
                      {propietarios.find(p => p.id === propietarioSeleccionado)?.apellido}
                    </small>
                  </div>

                  {/* Nombre del Paciente y Propietario deshabilitado */}
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
                      <label className="form-label">Propietario *</label>
                      <select className="form-select" disabled style={{ backgroundColor: '#e9ecef' }}>
                        <option>
                          {propietarios.find(p => p.id === propietarioSeleccionado)?.nombre}{' '}
                          {propietarios.find(p => p.id === propietarioSeleccionado)?.apellido}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Especie y Raza */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Especie *</label>
                      <select
                        className="form-select"
                        value={especieSeleccionada}
                        onChange={handleEspecieChange}
                        required
                      >
                        <option value="">Seleccione una especie</option>
                        {especies.map(esp => (
                          <option key={esp.id} value={esp.id}>
                            {esp.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Raza *</label>
                      {mostrarInputEspecieOtra ? (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Escriba el nombre de la raza"
                          value={razaPersonalizada}
                          onChange={(e) => setRazaPersonalizada(e.target.value)}
                          required
                        />
                      ) : (
                        <select
                          className="form-select"
                          name="id_raza"
                          value={formPaciente.id_raza}
                          onChange={handlePacienteInputChange}
                          required
                        >
                          <option value="">Seleccione una raza</option>
                          {razas.map(raza => (
                            <option key={raza.id} value={raza.id}>
                              {raza.nombre}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Input de especie personalizada (solo si es "Otro") */}
                  {mostrarInputEspecieOtra && (
                    <div className="mb-3">
                      <label className="form-label">Nombre de la Especie *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Ave, Reptil, Roedor, etc."
                        value={especiePersonalizada}
                        onChange={(e) => setEspeciePersonalizada(e.target.value)}
                        required={mostrarInputEspecieOtra}
                      />
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
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="castrado"
                          name="castrado"
                          checked={formPaciente.castrado}
                          onChange={handlePacienteInputChange}
                        />
                        <label className="form-check-label" htmlFor="castrado">
                          {formPaciente.castrado ? 'Sí' : 'No'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Fecha de Nacimiento con nota */}
                  <div className="mb-3">
                    <label className="form-label">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fecha_nacimiento"
                      value={formPaciente.fecha_nacimiento}
                      onChange={handlePacienteInputChange}
                      required
                    />
                    <small className="text-muted d-block mt-1">
                      Si no conoce la fecha exacta, ingrese una aproximada
                    </small>
                    <div className="form-check mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="edad_aproximada"
                        name="edad_aproximada"
                        checked={formPaciente.edad_aproximada}
                        onChange={handlePacienteInputChange}
                      />
                      <label className="form-check-label" htmlFor="edad_aproximada">
                        Edad aproximada
                      </label>
                    </div>
                  </div>

                  {/* Adoptado */}
                  <div className="mb-3">
                    <label className="form-label">Adoptado</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="adoptado"
                        name="adoptado"
                        checked={formPaciente.adoptado}
                        onChange={handlePacienteInputChange}
                      />
                      <label className="form-check-label" htmlFor="adoptado">
                        {formPaciente.adoptado ? 'Sí' : 'No'}
                      </label>
                    </div>
                  </div>

                  {/* Fecha de Adopción (condicional) */}
                  {formPaciente.adoptado && (
                    <div className="mb-3">
                      <label className="form-label">Fecha de Adopción *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="fecha_adopcion"
                        value={formPaciente.fecha_adopcion}
                        onChange={handlePacienteInputChange}
                        required={formPaciente.adoptado}
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
                    Guardar
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