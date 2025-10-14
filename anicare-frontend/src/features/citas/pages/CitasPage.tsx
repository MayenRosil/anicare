import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';

import { useEffect, useState } from 'react';
import axiosInstance from '../../../shared/config/axiosConfig';
import { obtenerPacientes } from '../services/pacienteService';
import { obtenerDoctores } from '../services/doctorService';
import { atenderCitaCompleta } from '../services/citaService';


export default function CitasPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [doctores, setDoctores] = useState<any[]>([]);

  const [modalNueva, setModalNueva] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [idPaciente, setIdPaciente] = useState('');
  const [idDoctor, setIdDoctor] = useState('');
  const [hora, setHora] = useState('');

  const [citaSeleccionada, setCitaSeleccionada] = useState<any | null>(null);

  const cargarCitas = async () => {
    const res = await axiosInstance.get('/citas');
    const citas = res.data.map((cita: any) => ({
      id: cita.id,
      title: `${pacientes.filter(p => p.id === cita.id_paciente)[0].nombre} (${cita.estado})`,
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
    }));

    //Se filtra para no ver las citas con estado Cancelada
    setEventos(citas.filter((cita: any) => cita.extendedProps.estado !== 'Cancelada'));
  };

  const cargarOpciones = async () => {
    const [pacs, docs] = await Promise.all([obtenerPacientes(), obtenerDoctores()]);
    setPacientes(pacs);
    setDoctores(docs);
  };

  useEffect(() => {
    if (pacientes.length === 0 && doctores.length === 0) cargarOpciones();
  }, []);

  useEffect(() => {
    if ((pacientes.length > 0 && doctores.length > 0) && eventos.length === 0) cargarCitas();
  }, [pacientes, doctores]);

  const handleDateClick = (arg: DateClickArg) => {

    const date = arg.dateStr.split('T')[0]; // "2025-10-08"
    const [year, month, day] = date.split('-');
    const fechaFormateada = [day, month, year].join('-'); // "08-10-2025"

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

    const [year, month, day] = fecha.split('-');
    const fechaFormateada = [day, month, year].join('-'); // "08-10-2025"




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
      console.log('Consulta creada con ID:', res.idConsulta);
      // 👇 si después haces la vista de consulta, acá podrás redirigir:
      // navigate(`/consulta/${res.idConsulta}`);
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

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-primary">Calendario de Citas</h3>

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
                  <label className="form-label">Comentario</label>
                  <input type="text" className="form-control" value={comentario} onChange={(e) => setComentario(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Paciente</label>
                  <select className="form-select" value={idPaciente} onChange={(e) => setIdPaciente(e.target.value)} required>
                    <option value="">Selecciona un paciente</option>
                    {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Doctor</label>
                  <select className="form-select" value={idDoctor} onChange={(e) => setIdDoctor(e.target.value)} required>
                    <option value="">Selecciona un doctor</option>
                    {doctores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalNueva(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleGuardarNueva}>Guardar</button>
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
                <h5 className="modal-title">Detalle de Cita</h5>
                <button type="button" className="btn-close" onClick={() => setModalDetalle(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Estado actual:</strong> {citaSeleccionada.estado}</p>

                <div className="mb-3">
                  <label className="form-label">Fecha (MM-DD-AAAA)</label>
                  <input type="date" className="form-control" value={fechaSeleccionada!} onChange={(e) => setFechaSeleccionada(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Hora</label>
                  <input type="time" className="form-control" value={hora} onChange={(e) => setHora(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Comentario</label>
                  <input type="text" className="form-control" value={comentario} onChange={(e) => setComentario(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Paciente</label>
                  <select className="form-select" value={idPaciente} onChange={(e) => setIdPaciente(e.target.value)}>
                    <option value="">Selecciona un paciente</option>
                    {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Doctor</label>
                  <select className="form-select" value={idDoctor} onChange={(e) => setIdDoctor(e.target.value)}>
                    <option value="">Selecciona un doctor</option>
                    {doctores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer justify-content-between">
                <button className="btn btn-danger" onClick={() => cambiarEstado(citaSeleccionada.id, 'Cancelada')}>Cancelar cita</button>
                <div>
                  {/* <button className="btn btn-outline-secondary me-2" disabled>Guardar</button> */}
                  <button className="btn btn-success" onClick={() => atenderCita(citaSeleccionada.id)}>Atender</button>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
