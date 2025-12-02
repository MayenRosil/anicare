// src/features/citas/pages/CitasPage.tsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../shared/config/axiosConfig';
import { obtenerPacientes } from '../services/pacienteService';
import { obtenerDoctores } from '../services/doctorService';
import { 
  obtenerCitasConDetalles, 
  crearCita, 
  actualizarEstadoCita,
  actualizarPacienteCita,
  atenderCitaCompleta 
} from '../services/citaService';
import ModalPacienteNuevo from '../components/ModalPacienteNuevo';

// Utilidad para convertir fechas UTC a local
const fixUtcToLocalDisplay = (isoString: string) => {
  const date = new Date(isoString);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

interface Paciente {
  id: number;
  nombre: string;
  nombre_propietario?: string;
}

interface Cita {
  id: number;
  id_paciente: number | null;
  nombre_paciente?: string;
  id_doctor: number;
  doctor_nombre?: string;
  doctor_apellido?: string;
  fecha_hora: string;
  estado: string;
  es_grooming: boolean; // ✨ AGREGAR
  comentario: string;
  esPacienteNuevo?: boolean;
  paciente_nombre?: string;
  propietario_nombre?: string;
}

export default function CitasPage() {
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState<'calendario' | 'historial'>('calendario');
  
  // Estados del calendario
  const [eventos, setEventos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [doctores, setDoctores] = useState<any[]>([]);

  // Estados del historial
  const [citas, setCitas] = useState<Cita[]>([]);
  const [citasFiltradas, setCitasFiltradas] = useState<Cita[]>([]);

  // Filtros del historial
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [busquedaDoctor, setBusquedaDoctor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  // Modales
  const [modalNueva, setModalNueva] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalPacienteNuevo, setModalPacienteNuevo] = useState(false);

  // Datos del formulario
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [idPaciente, setIdPaciente] = useState<string | null>('');
  const [idDoctor, setIdDoctor] = useState('');
  const [hora, setHora] = useState('');
  const [esGrooming, setEsGrooming] = useState(false); // ✨ NUEVO
  const [citaSeleccionada, setCitaSeleccionada] = useState<any | null>(null);
  const [citaParaAsignarPaciente, setCitaParaAsignarPaciente] = useState<number | null>(null);

  useEffect(() => {
    cargarOpciones();
  }, []);

  useEffect(() => {
    if (pacientes.length > 0 && doctores.length > 0) {
      cargarCitas();
    }
  }, [pacientes, doctores]);

  useEffect(() => {
    aplicarFiltros();
  }, [citas, busquedaPaciente, busquedaDoctor, fechaInicio, fechaFin, estadoFiltro]);

  const cargarOpciones = async () => {
    const [pacs, docs] = await Promise.all([obtenerPacientes(), obtenerDoctores()]);
    setPacientes(pacs);
    setDoctores(docs);
  };

  const cargarCitas = async () => {
    try {
      const citasData = await obtenerCitasConDetalles();

      // Preparar datos para el calendario
      const eventosCalendario = citasData
        .filter((cita: Cita) => cita.estado !== 'Cancelada')
        .map((cita: Cita) => {
          const titulo = cita.esPacienteNuevo 
            ? `PACIENTE NUEVO (${cita.estado})`
            : `${cita.paciente_nombre} (${cita.estado})`;

          return {
            id: cita.id,
            title: titulo,
            start: fixUtcToLocalDisplay(cita.fecha_hora),
            end: fixUtcToLocalDisplay(cita.fecha_hora),
            allDay: false,
            extendedProps: {
              comentario: cita.comentario,
              id_paciente: cita.id_paciente,
              id_doctor: cita.id_doctor,
              estado: cita.estado,
              fecha_hora: cita.fecha_hora,
              esPacienteNuevo: cita.esPacienteNuevo
            }
          };
        });

      setEventos(eventosCalendario);
      console.log(citasData)
      setCitas(citasData);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      alert('Error al cargar las citas');
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...citas];

    if (busquedaPaciente.trim()) {
      resultado = resultado.filter(c =>
        c.paciente_nombre?.toLowerCase().includes(busquedaPaciente.toLowerCase())
      );
    }

    if (busquedaDoctor.trim()) {
      resultado = resultado.filter(c =>
        c.doctor_nombre?.toLowerCase().includes(busquedaDoctor.toLowerCase())
        || c.doctor_apellido?.toLowerCase().includes(busquedaDoctor.toLowerCase())
      );
    }

    if (fechaInicio) {
      resultado = resultado.filter(c => {
        const fechaCita = new Date(c.fecha_hora).toISOString().split('T')[0];
        return fechaCita >= fechaInicio;
      });
    }

    if (fechaFin) {
      resultado = resultado.filter(c => {
        const fechaCita = new Date(c.fecha_hora).toISOString().split('T')[0];
        return fechaCita <= fechaFin;
      });
    }

    if (estadoFiltro) {
      resultado = resultado.filter(c => c.estado === estadoFiltro);
    }

    setCitasFiltradas(resultado);
  };

  const limpiarFiltros = () => {
    setBusquedaPaciente('');
    setBusquedaDoctor('');
    setFechaInicio('');
    setFechaFin('');
    setEstadoFiltro('');
  };

  const handleDateClick = (arg: DateClickArg) => {
    const date = arg.dateStr.split('T')[0];
    const [year, month, day] = date.split('-');
    const fechaFormateada = [day, month, year].join('-');

    const defaultTime = new Date().toLocaleTimeString('es-GT', {
      timeZone: 'America/Guatemala',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    setFechaSeleccionada(fechaFormateada);
    setHora(defaultTime);
    setComentario('');
    setIdPaciente('');
    setIdDoctor('');
    setEsGrooming(false); // ✨ NUEVO
    setModalNueva(true);
  };

  const handleGuardarNueva = async () => {
    if (!fechaSeleccionada || !hora || !comentario.trim() || !idDoctor) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    if (idPaciente === '' && idPaciente !== null) {
      alert('Seleccione un paciente o "PACIENTE NUEVO"');
      return;
    }

    const fechaHora = `${fechaSeleccionada}T${hora}`;

    try {
      await crearCita({
        fecha_hora: fechaHora,
        comentario,
        id_paciente: idPaciente === 'null' ? null : Number(idPaciente),
        id_doctor: Number(idDoctor),
        es_grooming: esGrooming // ✨ NUEVO
      });
      setModalNueva(false);
      cargarCitas();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la cita');
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    const props = arg.event.extendedProps;
    setCitaSeleccionada({
      id: arg.event.id,
      comentario: props.comentario,
      estado: props.estado,
      id_paciente: props.id_paciente,
      id_doctor: props.id_doctor,
      fecha_hora: props.fecha_hora,
      esPacienteNuevo: props.esPacienteNuevo
    });

    const fecha = new Date(props.fecha_hora);
    const [d, m, y] = [fecha.getDate(), fecha.getMonth() + 1, fecha.getFullYear()];
    const fechaF = `${d.toString().padStart(2,'0')}-${m.toString().padStart(2,'0')}-${y}`;
    const horaF = fecha.toTimeString().substring(0, 5);

    setFechaSeleccionada(fechaF);
    setHora(horaF);
    setComentario(props.comentario);
    setModalDetalle(true);
  };

  const cambiarEstado = async (id: number, estado: 'Cancelada') => {
    try {
      await actualizarEstadoCita(id, estado);
      setModalDetalle(false);
      cargarCitas();
    } catch (error) {
      alert('Error al cambiar el estado de la cita');
    }
  };

  const atenderCita = async (idCita: number) => {
    try {
      const cita = citas.find(c => c.id === idCita);
      
      // Si es PACIENTE NUEVO, mostrar modal para crear propietario + paciente
      if (cita?.esPacienteNuevo) {
        setCitaParaAsignarPaciente(idCita);
        setModalDetalle(false);
        setModalPacienteNuevo(true);
        return;
      }

      // ✨ Si es grooming, solo cambiar estado a Atendida
      if (cita?.es_grooming) {
        await actualizarEstadoCita(idCita, 'Atendida');
        setModalDetalle(false);
        alert('Cita de grooming marcada como atendida');
        cargarCitas();
        return;
      }

      // Si NO es grooming y tiene paciente, crear consulta y redirigir
      const resultado = await atenderCitaCompleta(idCita);
      setModalDetalle(false);
      navigate(`/consulta/${resultado.id_consulta}`);
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al atender la cita');
    }
  };

  const handlePacienteCreado = async (idPaciente: number) => {
    try {
      if (citaParaAsignarPaciente) {
        // 1. Asignar el paciente a la cita
        await actualizarPacienteCita(citaParaAsignarPaciente, idPaciente);
        
        // 2. ✨ Verificar si es cita de grooming
        const cita = citas.find(c => c.id === citaParaAsignarPaciente);
        
        if (cita?.es_grooming) {
          // Si es grooming, solo cambiar estado a Atendida
          await actualizarEstadoCita(citaParaAsignarPaciente, 'Atendida');
          setModalPacienteNuevo(false);
          setCitaParaAsignarPaciente(null);
          alert('Cita de grooming marcada como atendida');
          cargarCitas();
        } else {
          // Si NO es grooming, crear consulta y redirigir
          const resultado = await atenderCitaCompleta(citaParaAsignarPaciente);
          setModalPacienteNuevo(false);
          setCitaParaAsignarPaciente(null);
          navigate(`/consulta/${resultado.id_consulta}`);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al procesar la cita');
    }
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-warning text-dark';
      case 'Atendida': return 'bg-success';
      case 'Cancelada': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-calendar-check me-2"></i>
          Gestión de Citas
        </h2>
        <div className="btn-group">
          
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Dashboard
          </button>
          <button
            className={`btn ${vistaActual === 'calendario' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setVistaActual('calendario')}
          >
            <i className="bi bi-calendar3 me-2"></i>
            Calendario
          </button>
          <button
            className={`btn ${vistaActual === 'historial' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setVistaActual('historial')}
          >
            <i className="bi bi-clock-history me-2"></i>
            Historial
          </button>
        </div>
      </div>

      {/* Vista Calendario */}
      {vistaActual === 'calendario' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={10}
              weekends={true}
              events={eventos}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="auto"
            />
          </div>
        </div>
      )}

      {/* Vista Historial */}
      {vistaActual === 'historial' && (
        <>
          {/* Filtros */}
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-funnel me-2"></i>
                Filtros
              </h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Paciente</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre"
                    value={busquedaPaciente}
                    onChange={(e) => setBusquedaPaciente(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Doctor</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre"
                    value={busquedaDoctor}
                    onChange={(e) => setBusquedaDoctor(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Fecha inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Fecha fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Atendida">Atendida</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="col-md-12 d-flex justify-content-end">
                  <button className="btn btn-outline-danger" onClick={limpiarFiltros}>
                    <i className="bi bi-x-circle me-2"></i>
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="card border-warning">
                <div className="card-body text-center">
                  <h4 className="text-warning mb-0">
                    {citas.filter(c => c.estado === 'Pendiente').length}
                  </h4>
                  <small className="text-muted">Pendientes</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-success">
                <div className="card-body text-center">
                  <h4 className="text-success mb-0">
                    {citas.filter(c => c.estado === 'Atendida').length}
                  </h4>
                  <small className="text-muted">Atendidas</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-secondary">
                <div className="card-body text-center">
                  <h4 className="text-secondary mb-0">
                    {citas.filter(c => c.estado === 'Cancelada').length}
                  </h4>
                  <small className="text-muted">Canceladas</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <h4 className="text-primary mb-0">{citas.length}</h4>
                  <small className="text-muted">Total de Citas</small>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          {citasFiltradas.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron citas con los filtros aplicados.
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Fecha/Hora</th>
                        <th>Paciente</th>
                        <th>Propietario</th>
                        <th>Doctor</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasFiltradas.map((cita) => (
                        <tr key={cita.id}>
                          <td>
                            {new Date(cita.fecha_hora).toLocaleString('es-GT', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            {cita.esPacienteNuevo ? (
                              <span className="badge bg-info">PACIENTE NUEVO</span>
                            ) : (
                              cita.paciente_nombre || 'N/A'
                            )}
                          </td>
                          <td>{cita.propietario_nombre || 'N/A'}</td>
                          <td>{cita.doctor_nombre + ' ' + cita.doctor_apellido || 'N/A'}</td>
                          <td>{cita.comentario}</td>
                          <td>
                            <span className={`badge ${getBadgeClass(cita.estado)}`}>
                              {cita.estado}
                            </span>
                          </td>
                          <td className="text-center">
                            {cita.estado === 'Pendiente' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => atenderCita(cita.id)}
                              >
                                <i className="bi bi-play-fill me-1"></i>
                                Atender
                              </button>
                            )}
                            {cita.estado === 'Atendida' && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/paciente/${cita.id_paciente}/historial`)}
                              >
                                <i className="bi bi-eye me-1"></i>
                                Ver Historial
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Nueva Cita */}
      {modalNueva && (
        <div className="modal d-block" tabIndex={-1} style={{ background: '#00000066' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nueva Cita</h5>
                <button type="button" className="btn-close" onClick={() => setModalNueva(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Fecha:</strong> {fechaSeleccionada}</p>

                <div className="mb-3">
                  <label className="form-label">Hora *</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    value={hora} 
                    onChange={(e) => setHora(e.target.value)} 
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Motivo de Cita *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={comentario} 
                    onChange={(e) => setComentario(e.target.value)} 
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Paciente *</label>
                  <select 
                    className="form-select" 
                    value={idPaciente || ''} 
                    onChange={(e) => setIdPaciente(e.target.value)} 
                    required
                  >
                    <option value="">Seleccione un paciente</option>
                    <option value="null" className="fw-bold text-primary">
                      🆕 PACIENTE NUEVO
                    </option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.nombre_propietario && `(${p.nombre_propietario})`}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">
                    Seleccione "PACIENTE NUEVO" si los datos del paciente se completarán al atender la cita
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Doctor *</label>
                  <select 
                    className="form-select" 
                    value={idDoctor} 
                    onChange={(e) => setIdDoctor(e.target.value)} 
                    required
                  >
                    <option value="">Seleccione un doctor</option>
                    {doctores.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>
                    ))}
                  </select>
                </div>

                {/* ✨ NUEVO: Checkbox de Grooming */}
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="esGrooming"
                    checked={esGrooming}
                    onChange={(e) => setEsGrooming(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="esGrooming">
                    <strong>Es cita de Grooming</strong> (no crear consulta médica automáticamente)
                  </label>
                  <div className="form-text">
                    Marque esta opción solo para citas de baño, corte de pelo u otros servicios de grooming que no requieren consulta veterinaria.
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalNueva(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleGuardarNueva}>
                  Guardar Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Cita */}
      {modalDetalle && citaSeleccionada && (
        <div className="modal d-block" tabIndex={-1} style={{ background: '#00000066' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle de Cita #{citaSeleccionada.id}</h5>
                <button type="button" className="btn-close" onClick={() => setModalDetalle(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Fecha:</strong> {fechaSeleccionada}</p>
                <p><strong>Hora:</strong> {hora}</p>
                <p><strong>Paciente:</strong> {
                  citaSeleccionada.esPacienteNuevo 
                    ? <span className="badge bg-info">PACIENTE NUEVO</span>
                    : pacientes.find(p => p.id === citaSeleccionada.id_paciente)?.nombre || 'N/A'
                }</p>
                <p><strong>Doctor:</strong> {doctores.find(d => d.id === citaSeleccionada.id_doctor)?.nombre || 'N/A'}</p>
                <p><strong>Motivo:</strong> {comentario}</p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className={`badge ${getBadgeClass(citaSeleccionada.estado)}`}>
                    {citaSeleccionada.estado}
                  </span>
                </p>
              </div>
              <div className="modal-footer">
                {citaSeleccionada.estado === 'Pendiente' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => cambiarEstado(citaSeleccionada.id, 'Cancelada')}
                    >
                      Cancelar Cita
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() =>{ atenderCita(Number(citaSeleccionada.id))}}
                    >
                      Atender Cita
                    </button>
                  </>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setModalDetalle(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear propietario + paciente */}
      {modalPacienteNuevo && (
        <ModalPacienteNuevo
          onClose={() => {
            setModalPacienteNuevo(false);
            setCitaParaAsignarPaciente(null);
          }}
          onPacienteCreado={handlePacienteCreado}
        />
      )}
    </div>
  );
}