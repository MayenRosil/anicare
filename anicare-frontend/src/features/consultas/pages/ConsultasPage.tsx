// src/features/consultas/pages/ConsultasPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../shared/config/axiosConfig';

interface Consulta {
  id: number;
  id_paciente: number;
  nombre_paciente: string;
  id_doctor: number;
  nombre_doctor: string;
  fecha_hora: string;
  estado: string;
  diagnostico?: string;
  notas_adicionales?: string;
}

export default function ConsultasPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [consultasFiltradas, setConsultasFiltradas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filtros
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  useEffect(() => {
    cargarConsultas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [consultas, busquedaPaciente, fechaInicio, fechaFin, estadoFiltro]);

  const cargarConsultas = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/consultas/todas');
      setConsultas(res.data);
    } catch (error) {
      console.error('Error al cargar consultas:', error);
      alert('Error al cargar las consultas');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...consultas];

    // Filtro por nombre de paciente
    if (busquedaPaciente.trim()) {
      resultado = resultado.filter(c =>
        c.nombre_paciente.toLowerCase().includes(busquedaPaciente.toLowerCase())
      );
    }

    // Filtro por rango de fechas
    if (fechaInicio) {
      resultado = resultado.filter(c => {
        const fechaConsulta = new Date(c.fecha_hora).toISOString().split('T')[0];
        return fechaConsulta >= fechaInicio;
      });
    }

    if (fechaFin) {
      resultado = resultado.filter(c => {
        const fechaConsulta = new Date(c.fecha_hora).toISOString().split('T')[0];
        return fechaConsulta <= fechaFin;
      });
    }

    // Filtro por estado
    if (estadoFiltro) {
      resultado = resultado.filter(c => c.estado === estadoFiltro);
    }

    setConsultasFiltradas(resultado);
  };

  const limpiarFiltros = () => {
    setBusquedaPaciente('');
    setFechaInicio('');
    setFechaFin('');
    setEstadoFiltro('');
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Abierta':
        return 'bg-warning text-dark';
      case 'Finalizada':
        return 'bg-success';
      case 'Cancelada':
        return 'bg-secondary';
      default:
        return 'bg-info';
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando consultas...</p>
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
            <i className="bi bi-clipboard2-pulse-fill me-2"></i>
            Historial de Consultas
          </h3>
          <p className="text-muted mb-0">
            {consultasFiltradas.length} consulta{consultasFiltradas.length !== 1 ? 's' : ''} encontrada{consultasFiltradas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Dashboard
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="bi bi-funnel me-2"></i>
            Filtros
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Buscar paciente</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del paciente..."
                value={busquedaPaciente}
                onChange={(e) => setBusquedaPaciente(e.target.value)}
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
                <option value="Abierta">Abierta</option>
                <option value="Finalizada">Finalizada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-outline-danger w-100" onClick={limpiarFiltros}>
                <i className="bi bi-x-circle me-2"></i>
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Consultas */}
      {consultasFiltradas.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No se encontraron consultas con los filtros aplicados.
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
                    <th>Diagnóstico</th>
                    <th>Estado</th>
                    <th className="pe-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {consultasFiltradas.map((consulta) => (
                    <tr key={consulta.id}>
                      <td className="ps-3">
                        <strong>#{consulta.id}</strong>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{consulta.nombre_paciente}</div>
                          <small className="text-muted">ID: {consulta.id_paciente}</small>
                        </div>
                      </td>
                      <td>{consulta.nombre_doctor || '—'}</td>
                      <td>
                        <div>
                          <div>{new Date(consulta.fecha_hora).toLocaleDateString('es-GT')}</div>
                          <small className="text-muted">
                            {new Date(consulta.fecha_hora).toLocaleTimeString('es-GT', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </td>
                      <td>
                        {consulta.diagnostico ? (
                          <span className="badge bg-info">{consulta.diagnostico}</span>
                        ) : (
                          <span className="text-muted">Sin diagnóstico</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getBadgeClass(consulta.estado)}`}>
                          {consulta.estado}
                        </span>
                      </td>
                      <td className="pe-3">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/consulta/${consulta.id}`)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Ver Detalle
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

      {/* Resumen de estadísticas */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card border-warning">
            <div className="card-body text-center">
              <h4 className="text-warning mb-0">
                {consultas.filter(c => c.estado === 'Abierta').length}
              </h4>
              <small className="text-muted">Consultas Abiertas</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-success">
            <div className="card-body text-center">
              <h4 className="text-success mb-0">
                {consultas.filter(c => c.estado === 'Finalizada').length}
              </h4>
              <small className="text-muted">Consultas Finalizadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-secondary">
            <div className="card-body text-center">
              <h4 className="text-secondary mb-0">
                {consultas.filter(c => c.estado === 'Cancelada').length}
              </h4>
              <small className="text-muted">Consultas Canceladas</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}