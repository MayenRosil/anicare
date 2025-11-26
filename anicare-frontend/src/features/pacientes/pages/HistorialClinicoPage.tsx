// src/features/pacientes/pages/HistorialClinicoPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerConsultasPorPaciente } from '../services/pacienteService';

export default function HistorialClinicoPage() {
  const { idPaciente } = useParams<{ idPaciente: string }>();
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (idPaciente) cargarConsultas();
  }, [idPaciente]);

  const cargarConsultas = async () => {
    try {
      setLoading(true);
      const data = await obtenerConsultasPorPaciente(Number(idPaciente));
      console.log(data)
      setConsultas(data);
    } catch (error) {
      alert('Error al cargar el historial clínico');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando historial clínico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary mb-1">📋 Historial Clínico</h3>
          <p className="text-muted mb-0">Paciente ID: {idPaciente}</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total de Consultas</h6>
              <h2 className="mb-0">{consultas.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Finalizadas</h6>
              <h2 className="mb-0">{consultas.filter(c => c.estado === 'Finalizada').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h6 className="card-title">Abiertas</h6>
              <h2 className="mb-0">{consultas.filter(c => c.estado === 'Abierta').length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de consultas */}
      {consultas.length === 0 ? (
        <div className="alert alert-info">
          <h5>📝 No hay consultas registradas</h5>
          <p className="mb-0">Este paciente aún no tiene consultas en su historial médico.</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-light">
            <h5 className="mb-0">Historial de Consultas</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Motivo</th>
                    <th>Doctor</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {consultas.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold">
                            {new Date(c.fecha_hora).toLocaleDateString('es-GT')}
                          </span>
                          <small className="text-muted">
                            {new Date(c.fecha_hora).toLocaleTimeString('es-GT', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {c.comentario ? (
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                              {c.comentario}
                            </span>
                          ) : (
                            <span className="text-muted fst-italic">Sin motivo registrado</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-2" 
                               style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                            {c.doctor_nombre?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="fw-bold">
                              Dr(a). {c.doctor_nombre} {c.doctor_apellido}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          c.estado === 'Finalizada' ? 'bg-success' :
                          c.estado === 'Abierta' ? 'bg-warning text-dark' : 
                          'bg-secondary'
                        }`}>
                          {c.estado === 'Finalizada' ? '✓ ' : ''}
                          {c.estado}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/consulta/${c.id}`)}
                        >
                          {c.estado === 'Abierta' ? '✏️ Editar' : '👁️ Ver Detalle'}
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

      {/* Información adicional */}
      {consultas.length > 0 && (
        <div className="alert alert-light mt-3">
          <small className="text-muted">
            <strong>ℹ️ Nota:</strong> Las consultas aparecen ordenadas de la más reciente a la más antigua.
            Haz clic en "Editar" o "Ver Detalle" para ver la información completa de cada consulta.
          </small>
        </div>
      )}
    </div>
  );
}