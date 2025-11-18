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
import { atenderCitaCompleta } from '../services/citaService';

interface Cita {
  id: number;
  id_paciente: number;
  nombre_paciente?: string;
  id_doctor: number;
  nombre_doctor?: string;
  fecha_hora: string;
  estado: string;
  comentario: string;
}

export default function CitasPage() {
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState<'calendario' | 'historial'>('calendario');
  
  // Estados del calendario
  const [eventos, setEventos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
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

  // Datos del formulario
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [idPaciente, setIdPaciente] = useState('');
  const [idDoctor, setIdDoctor] = useState('');
  const [hora, setHora] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState<any | null>(null);

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
      const res = await axiosInstance.get('/citas');
      const citasData = res.data;

      // Preparar datos para el calendario
      const eventosCalendario = citasData
        .filter((cita: any) => cita.estado !== 'Cancelada')
        .map((cita: any) => {
          const paciente = pacientes.find(p => p.id === cita.id_paciente);
          return {
            id: cita.id,
            title: `${paciente?.nombre || 'Paciente'} (${cita.estado})`,
            start: fixUtcToLocalDisplay(cita.fecha_hora),
            end: fixUtcToLocalDisplay(cita.fecha_hora),
            allDay: false,
            extendedProps: {
              comentario: cita.comentario,
              id_paciente: cita.id_paciente,
              id_doctor: cita.id_doctor,
              estado: cita.estado,
              fecha_hora: cita.fecha_hora
            }
          };
        });

      setEventos(eventosCalendario);

      // Preparar datos para el historial
      const citasConNombres = citasData.map((cita: any) => ({
        ...cita,
        nombre_paciente: pacientes.find(p => p.id === cita.id_paciente)?.nombre || 'Desconocido',
        nombre_doctor: doctores.find(d => d.id === cita.id_doctor)?.nombre || 'Desconocido'
      }));

      setCitas(citasConNombres);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      alert('Error al cargar las citas');
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...citas];

    if (busquedaPaciente.trim()) {
      resultado = resultado.filter(c =>
        c.nombre_paciente?.toLowerCase().includes(busquedaPaciente.toLowerCase())
      );
    }

    if (busquedaDoctor.trim()) {
      resultado = resultado.filter(c =>
        c.nombre_doctor?.toLowerCase().includes(busquedaDoctor.toLowerCase())
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
    setModalNueva(true);
  };

  const handleGuardarNueva = async () => {
    if (!fechaSeleccionada || !hora || !comentario.trim() || !idPaciente || !idDoctor) {
      alert('Completa todos los campos');
      return;
    }

    const fechaHora = `${fechaSeleccionada}T${hora}`;

    try {
      await axiosInstance.post('/citas', {
        fecha_hora: fechaHora,
        comentario,
        id_paciente: Number(idPaciente),
        id_doctor: Number(idDoctor)
      });
      setModalNueva(false);
      cargarCitas();
    } catch {
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
      fecha_hora: props.fecha_hora
    });

    const [fecha, hora] = props.fecha_hora.split('T');
    setFechaSeleccionada(fecha);
    setHora(hora.slice(0, 5));
    setComentario(props.comentario);
    setIdPaciente(String(props.id_paciente));
    setIdDoctor(String(props.id_doctor));
    setModalDetalle(true);
  };

  const cambiarEstado = async (id: number, nuevoEstado: 'Cancelada' | 'Atendida') => {
    try {
      await axiosInstance.patch(`/citas/${id}/estado`, { estado: nuevoEstado });
      setModalDetalle(false);
      cargarCitas();
    } catch {
      alert('Error al actualizar estado');
    }
  };

  const atenderCita = async (cita: number) => {
    try {
      const res = await atenderCitaCompleta(cita);
      alert('Cita atendida correctamente');
      setModalDetalle(false);
      cargarCitas();
      navigate(`/consulta/${res.idConsulta}`);
    } catch (error: any) {
      alert(error.response?.data?.mensaje || 'Error al atender la cita');
    }
  };

  function fixUtcToLocalDisplay(isoString: string): Date {
    const d = new Date(isoString);
    return new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    );
  }

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-warning text-dark';
      case 'Atendida':
        return 'bg-success';
      case 'Cancelada':
        return 'bg-secondary';
      default:
        return 'bg-info';
    }
  };

  return (
    <div className="container-fluid mt-4">
      {/* Header con botones de navegación */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary mb-1">
            <i className="bi bi-calendar-check-fill me-2"></i>
            Gestión de Citas
          </h3>
          <p className="text-muted mb-0">
            {vistaActual === 'calendario' ? 'Vista de Calendario' : 'Historial de Citas'}
          </p>
        </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Dashboard
        </button>
        <div className="btn-group" role="group">
          
          <button
            type="button"
            className={`btn ${vistaActual === 'calendario' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setVistaActual('calendario')}
          >
            <i className="bi bi-calendar3 me-2"></i>
            Calendario
          </button>
          <button
            type="button"
            className={`btn ${vistaActual === 'historial' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setVistaActual('historial')}
          >
            <i className="bi bi-clock-history me-2"></i>
            Historial
          </button>
        </div>
      </div>

      {/* VISTA DE CALENDARIO */}
      {vistaActual === 'calendario' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale={esLocale}
              selectable={true}
              editable={false}
              events={eventos}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="auto"
              timeZone="local"
            />
          </div>
        </div>
      )}

      {/* VISTA DE HISTORIAL */}
      {vistaActual === 'historial' && (
        <>
          {/* Filtros */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-funnel me-2"></i>
                Filtros
              </h5>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label">Paciente</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar paciente..."
                    value={busquedaPaciente}
                    onChange={(e) => setBusquedaPaciente(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Doctor</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar doctor..."
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

                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-outline-danger w-100" onClick={limpiarFiltros}>
                    <i className="bi bi-x-circle me-2"></i>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Citas */}
          {citasFiltradas.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron citas con los filtros aplicados.
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">ID</th>
                        <th>Paciente</th>
                        <th>Doctor</th>
                        <th>Fecha y Hora</th>
                        <th>Comentario</th>
                        <th>Estado</th>
                        <th className="pe-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasFiltradas.map((cita) => (
                        <tr key={cita.id}>
                          <td className="ps-3">
                            <strong>#{cita.id}</strong>
                          </td>
                          <td>
                            <div className="fw-bold">{cita.nombre_paciente}</div>
                            <small className="text-muted">ID: {cita.id_paciente}</small>
                          </td>
                          <td>{cita.nombre_doctor}</td>
                          <td>
                            <div>{new Date(cita.fecha_hora).toLocaleDateString('es-GT')}</div>
                            <small className="text-muted">
                              {new Date(cita.fecha_hora).toLocaleTimeString('es-GT', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">{cita.comentario || '—'}</small>
                          </td>
                          <td>
                            <span className={`badge ${getBadgeClass(cita.estado)}`}>
                              {cita.estado}
                            </span>
                          </td>
                          <td className="pe-3">
                            {cita.estado === 'Pendiente' && (
                              <button
                                className="btn btn-sm btn-success me-1"
                                onClick={() => atenderCita(cita.id)}
                              >
                                <i className="bi bi-check-circle me-1"></i>
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

          {/* Estadísticas */}
          <div className="row mt-4">
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
                  <label className="form-label">Hora</label>
                  <input type="time" className="form-control" value={hora} onChange={(e) => setHora(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Motivo de Cita</label>
                  <input type="text" className="form-control" value={comentario} onChange={(e) => setComentario(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Paciente</label>
                  <select className="form-select" value={idPaciente} onChange={(e) => setIdPaciente(e.target.value)} required>
                    <option value="">Seleccione un paciente</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Doctor</label>
                  <select className="form-select" value={idDoctor} onChange={(e) => setIdDoctor(e.target.value)} required>
                    <option value="">Seleccione un doctor</option>
                    {doctores.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>
                    ))}
                  </select>
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
                <p><strong>Paciente:</strong> {pacientes.find(p => p.id === citaSeleccionada.id_paciente)?.nombre}</p>
                <p><strong>Doctor:</strong> {doctores.find(d => d.id === citaSeleccionada.id_doctor)?.nombre}</p>
                <p><strong>Comentario:</strong> {comentario}</p>
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
                      onClick={() => atenderCita(citaSeleccionada.id)}
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
    </div>
  );
}