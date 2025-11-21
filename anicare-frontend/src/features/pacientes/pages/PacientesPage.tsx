// anicare-frontend/src/features/pacientes/pages/PacientesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
  type Paciente
} from '../services/pacienteService';
import { obtenerPropietarios, type Propietario } from '../../propietarios/services/propietarioService';
import { 
  obtenerRazasPorEspecie, 
  buscarOCrearRazaPersonalizada,
  type Raza, 
  obtenerRazaPorId
} from '../services/razaService';
import { obtenerEspecies, type Especie } from '../services/especieService';

export default function PacientesPage() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [razas, setRazas] = useState<Raza[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [pacienteEditar, setPacienteEditar] = useState<Paciente | null>(null);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    sexo: 'M' as 'M' | 'F',
    color: '',
    fecha_nacimiento: '',
    id_raza: 0,
    id_propietario: 0,
    castrado: false,
    adoptado: false,
    fecha_adopcion: '',
    edad_aproximada: false
  });

  // Estados para la lógica de especies
  const [especieSeleccionada, setEspecieSeleccionada] = useState<number>(1); // 1=Canino por defecto
  const [especiePersonalizada, setEspeciePersonalizada] = useState('');
  const [razaPersonalizada, setRazaPersonalizada] = useState('');
  const [modoEscribirRaza, setModoEscribirRaza] = useState(false); // Solo para especie "Otro"

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    // Cuando cambia la especie seleccionada, cargar las razas correspondientes
    if (especieSeleccionada > 0) {
      cargarRazasPorEspecie(especieSeleccionada);
    }
  }, [especieSeleccionada]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [pacs, props, esps] = await Promise.all([
        obtenerPacientes(),
        obtenerPropietarios(),
        obtenerEspecies()
      ]);
      setPacientes(pacs);
      setPropietarios(props);
      setEspecies(esps);
      
      // Cargar razas de Canino por defecto
      const razasCanino = await obtenerRazasPorEspecie(1);
      setRazas(razasCanino);
    } catch (error) {
      console.error(error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarRazasPorEspecie = async (idEspecie: number) => {
    try {
      const razasPorEspecie = await obtenerRazasPorEspecie(idEspecie);
      setRazas(razasPorEspecie);
      
      // Si hay razas, seleccionar la primera por defecto
      if (razasPorEspecie.length > 0 && !modoEdicion) {
        setFormData(prev => ({ ...prev, id_raza: razasPorEspecie[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar razas:', error);
      setRazas([]);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setPacienteEditar(null);
    setEspecieSeleccionada(1); // Canino por defecto
    setEspeciePersonalizada('');
    setRazaPersonalizada('');
    setModoEscribirRaza(false);
    setFormData({
      nombre: '',
      sexo: 'M',
      color: '',
      fecha_nacimiento: '',
      id_raza: razas[0]?.id || 0,
      id_propietario: propietarios[0]?.id || 0,
      castrado: false,
      adoptado: false,
      fecha_adopcion: '',
      edad_aproximada: false
    });
    setMostrarModal(true);
  };

const abrirModalEditar = async (paciente: Paciente) => {
  try {
    setModoEdicion(true);
    setPacienteEditar(paciente);
    
    // 🔥 CORRECCIÓN: Obtener la raza completa desde el backend
    const razaCompleta = await obtenerRazaPorId(paciente.id_raza);
    const idEspecie = razaCompleta.id_especie;
    
    console.log('Raza del paciente:', razaCompleta);
    console.log('ID Especie:', idEspecie);
    
    // Establecer la especie seleccionada
    setEspecieSeleccionada(idEspecie);
    
    // Cargar las razas de esa especie
    const razasDeEspecie = await obtenerRazasPorEspecie(idEspecie);
    setRazas(razasDeEspecie);
    
    // Si es especie "Otro" y tiene especie personalizada, llenar el campo
    if (idEspecie === 3 && razaCompleta.especie_personalizada) {
      setEspeciePersonalizada(razaCompleta.especie_personalizada);
    }
    
    // Llenar el formulario con los datos del paciente
    setFormData({
      nombre: paciente.nombre,
      sexo: paciente.sexo,
      color: paciente.color,
      fecha_nacimiento: paciente.fecha_nacimiento,
      id_raza: paciente.id_raza,
      id_propietario: paciente.id_propietario,
      castrado: paciente.castrado || false,
      adoptado: paciente.adoptado || false,
      fecha_adopcion: paciente.fecha_adopcion || '',
      edad_aproximada: paciente.edad_aproximada || false
    });
    
    setMostrarModal(true);
  } catch (error) {
    console.error('Error al cargar datos del paciente:', error);
    alert('Error al cargar los datos del paciente para editar');
  }
};

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormData({
      nombre: '',
      sexo: 'M',
      color: '',
      fecha_nacimiento: '',
      id_raza: 0,
      id_propietario: 0,
      castrado: false,
      adoptado: false,
      fecha_adopcion: '',
      edad_aproximada: false
    });
    setPacienteEditar(null);
    setEspecieSeleccionada(1);
    setEspeciePersonalizada('');
    setRazaPersonalizada('');
    setModoEscribirRaza(false);
  };

  const handleEspecieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaEspecie = parseInt(e.target.value);
    setEspecieSeleccionada(nuevaEspecie);
    setEspeciePersonalizada('');
    setRazaPersonalizada('');
    setModoEscribirRaza(nuevaEspecie === 3); // Solo permitir escribir si es "Otro"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.id_propietario) {
      alert('El nombre y propietario son obligatorios');
      return;
    }

    try {
      let idRazaFinal = formData.id_raza;

      // Si es especie "Otro" y está escribiendo una raza nueva, crearla
      if (especieSeleccionada === 3 && modoEscribirRaza && razaPersonalizada.trim()) {
        if (!especiePersonalizada.trim()) {
          alert('Por favor especifica el tipo de animal en "Especie Personalizada"');
          return;
        }
        
        const resultado = await buscarOCrearRazaPersonalizada(
          razaPersonalizada.trim(),
          especiePersonalizada.trim()
        );
        idRazaFinal = resultado.id;
      } else if (!idRazaFinal || idRazaFinal === 0) {
        alert('Por favor selecciona una raza');
        return;
      }

      const datosAGuardar = {
        ...formData,
        id_raza: idRazaFinal,
        fecha_adopcion: formData.adoptado && formData.fecha_adopcion ? formData.fecha_adopcion : null
      };

      if (modoEdicion && pacienteEditar) {
        await actualizarPaciente(pacienteEditar.id!, datosAGuardar);
        alert('Paciente actualizado exitosamente');
      } else {
        await crearPaciente(datosAGuardar);
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
            <i className="bi bi-heart-pulse-fill me-2"></i>
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
              placeholder="Buscar por nombre de paciente o propietario..."
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
          No se encontraron pacientes.
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Especie</th>
                    <th>Raza</th>
                    <th>Sexo</th>
                    <th>Castrado</th>
                    <th>Propietario</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map(pac => (
                    <tr key={pac.id}>
                      <td>
                        <strong>{pac.nombre}</strong>
                        {pac.adoptado && (
                          <span className="badge bg-info ms-2">Adoptado</span>
                        )}
                      </td>
                      <td>{pac.nombre_especie || 'N/A'}</td>
                      <td>{pac.nombre_raza || 'N/A'}</td>
                      <td>{pac.sexo === 'M' ? 'Macho' : 'Hembra'}</td>
                      <td>
                        {pac.castrado ? (
                          <span className="badge bg-success">Sí</span>
                        ) : (
                          <span className="badge bg-secondary">No</span>
                        )}
                      </td>
                      <td>{pac.nombre_propietario || obtenerNombrePropietario(pac.id_propietario)}</td>
                      <td className="text-center">
                          <button
    className="btn btn-sm btn-outline-info me-2"
    onClick={() => navigate(`/paciente/${pac.id}/historial`)}
    title="Ver Historial Clínico"
  >
    <i className="bi bi-file-medical-fill"></i> Historial
  </button>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => abrirModalEditar(pac)}
                        >
                          <i className="bi bi-pencil-fill"></i> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(pac.id!, pac.nombre)}
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

      {/* Modal Crear/Editar */}
      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modoEdicion ? (
                    <>
                      <i className="bi bi-pencil-fill me-2"></i>
                      Editar Paciente
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Nuevo Paciente
                    </>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Nombre */}
                  <div className="mb-3">
                    <label className="form-label">Nombre del Paciente *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>

                  {/* Propietario */}
                  <div className="mb-3">
                    <label className="form-label">Propietario *</label>
                    <select
                      className="form-select"
                      value={formData.id_propietario}
                      onChange={(e) => setFormData({ ...formData, id_propietario: parseInt(e.target.value) })}
                      required
                    >
                      <option value="">Seleccione un propietario</option>
                      {propietarios.map(prop => (
                        <option key={prop.id} value={prop.id}>
                          {prop.nombre} {prop.apellido}
                        </option>
                      ))}
                    </select>
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
                      {especies.map(esp => (
                        <option key={esp.id} value={esp.id}>
                          {esp.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Si es "Otro", mostrar campo de especie personalizada */}
                  {especieSeleccionada === 3 && (
                    <div className="mb-3">
                      <label className="form-label">Tipo de Animal (Especificar) *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Conejo, Ave, Reptil, etc."
                        value={especiePersonalizada}
                        onChange={(e) => setEspeciePersonalizada(e.target.value)}
                        required={especieSeleccionada === 3}
                      />
                      <small className="text-muted">
                        Especifica el tipo de animal (Ave, Reptil, Roedor, etc.)
                      </small>
                    </div>
                  )}

                  {/* Raza */}
                  <div className="mb-3">
                    <label className="form-label">Raza *</label>
                    {especieSeleccionada === 3 && (
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="escribirRaza"
                          checked={modoEscribirRaza}
                          onChange={(e) => {
                            setModoEscribirRaza(e.target.checked);
                            if (!e.target.checked) {
                              setRazaPersonalizada('');
                            }
                          }}
                        />
                        <label className="form-check-label" htmlFor="escribirRaza">
                          Escribir nueva raza
                        </label>
                      </div>
                    )}

                    {modoEscribirRaza && especieSeleccionada === 3 ? (
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
                        value={formData.id_raza}
                        onChange={(e) => setFormData({ ...formData, id_raza: parseInt(e.target.value) })}
                        required={!modoEscribirRaza}
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

                  <div className="row">
                    {/* Sexo */}
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

                    {/* Castrado */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Castrado</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="castrado"
                          checked={formData.castrado}
                          onChange={(e) => setFormData({ ...formData, castrado: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="castrado">
                          {formData.castrado ? 'Sí' : 'No'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Fecha de Nacimiento y Edad Aproximada */}
                  <div className="mb-3">
                    <label className="form-label">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fecha_nacimiento}
                      onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                      required
                    />
                    <div className="form-check mt-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="edadAproximada"
                        checked={formData.edad_aproximada}
                        onChange={(e) => setFormData({ ...formData, edad_aproximada: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="edadAproximada">
                        <small className="text-muted">
                          La fecha de nacimiento es aproximada (no se conoce con exactitud)
                        </small>
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
                        checked={formData.adoptado}
                        onChange={(e) => setFormData({ ...formData, adoptado: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="adoptado">
                        {formData.adoptado ? 'Sí' : 'No'}
                      </label>
                    </div>
                  </div>

                  {/* Fecha de Adopción (solo si adoptado) */}
                  {formData.adoptado && (
                    <div className="mb-3">
                      <label className="form-label">Fecha de Adopción</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.fecha_adopcion}
                        onChange={(e) => setFormData({ ...formData, fecha_adopcion: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Color */}
                  <div className="mb-3">
                    <label className="form-label">Color del Manto *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Blanco, Negro, Café, etc."
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
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