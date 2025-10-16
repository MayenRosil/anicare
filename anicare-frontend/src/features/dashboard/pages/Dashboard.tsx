// anicare-frontend/src/features/dashboard/pages/Dashboard.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useEffect, useState } from 'react';
import axiosInstance from '../../../shared/config/axiosConfig';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [estadisticas, setEstadisticas] = useState({
    citasHoy: 0,
    consultasRealizadas: 0,
    citasPendientes: 0,
    totalPacientes: 0
  });
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargandoEstadisticas(true);
      
      const [citasRes, consultasRes, pacientesRes] = await Promise.all([
        axiosInstance.get('/citas'),
        axiosInstance.get('/consultas/todas'),
        axiosInstance.get('/pacientes')
      ]);

      const citas = citasRes.data;
      const consultas = consultasRes.data;
      const pacientes = pacientesRes.data;

      const ahora = new Date();
      const año = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const dia = String(ahora.getDate()).padStart(2, '0');
      const hoy = `${año}-${mes}-${dia}`;

      const citasHoy = citas.filter((cita: any) => {
        const fechaCita = cita.fecha_hora.split('T')[0];
        return fechaCita === hoy;
      }).length;

      const consultasHoy = consultas.filter((consulta: any) => {
        const fechaConsulta = consulta.fecha_hora.split('T')[0];
        return fechaConsulta === hoy && consulta.estado === 'Finalizada';
      }).length;

      const citasPendientes = citas.filter((cita: any) => cita.estado === 'Pendiente').length;

      setEstadisticas({
        citasHoy,
        consultasRealizadas: consultasHoy,
        citasPendientes,
        totalPacientes: pacientes.length
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-primary">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard - AniCare
          </h2>
          <p className="text-muted mb-0">
            Bienvenido, <strong>{usuario?.nombre}</strong>
          </p>
        </div>
        <button className="btn btn-outline-danger" onClick={logout}>
          <i className="bi bi-box-arrow-right me-2"></i>
          Cerrar Sesión
        </button>
      </div>

      {/* Estadísticas del día */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-4">
                <i className="bi bi-graph-up me-2"></i>
                Resumen del día
              </h5>
              {cargandoEstadisticas ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="d-flex align-items-center p-3 bg-primary bg-opacity-10 rounded">
                      <div className="me-3">
                        <i className="bi bi-calendar-check-fill fs-2 text-primary"></i>
                      </div>
                      <div>
                        <h3 className="mb-0">{estadisticas.citasHoy}</h3>
                        <small className="text-muted">Citas hoy</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center p-3 bg-success bg-opacity-10 rounded">
                      <div className="me-3">
                        <i className="bi bi-clipboard2-pulse-fill fs-2 text-success"></i>
                      </div>
                      <div>
                        <h3 className="mb-0">{estadisticas.consultasRealizadas}</h3>
                        <small className="text-muted">Consultas realizadas</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center p-3 bg-warning bg-opacity-10 rounded">
                      <div className="me-3">
                        <i className="bi bi-hourglass-split fs-2 text-warning"></i>
                      </div>
                      <div>
                        <h3 className="mb-0">{estadisticas.citasPendientes}</h3>
                        <small className="text-muted">Citas pendientes</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center p-3 bg-info bg-opacity-10 rounded">
                      <div className="me-3">
                        <i className="bi bi-heart-pulse-fill fs-2 text-info"></i>
                      </div>
                      <div>
                        <h3 className="mb-0">{estadisticas.totalPacientes}</h3>
                        <small className="text-muted">Total pacientes</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Módulos principales */}
      <div className="row g-4 mb-4">
        // Continuación de Dashboard.tsx - Módulos principales

        {/* Pacientes */}
        <div className="col-md-4">
          <div className="card h-100 border-info shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-info text-white rounded-circle p-3 me-3">
                  <i className="bi bi-heart-pulse-fill fs-4"></i>
                </div>
                <h5 className="card-title text-info mb-0">Pacientes</h5>
              </div>
              <p className="card-text text-muted">Gestión de pacientes y expedientes médicos</p>
              <button className="btn btn-info w-100" onClick={() => navigate('/pacientes')}>
                Ir a Pacientes
              </button>
            </div>
          </div>
        </div>

        {/* Propietarios */}
        <div className="col-md-4">
          <div className="card h-100 border-success shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success text-white rounded-circle p-3 me-3">
                  <i className="bi bi-people-fill fs-4"></i>
                </div>
                <h5 className="card-title text-success mb-0">Propietarios</h5>
              </div>
              <p className="card-text text-muted">Gestión de datos de propietarios</p>
              <button className="btn btn-success w-100" onClick={() => navigate('/propietarios')}>
                Ir a Propietarios
              </button>
            </div>
          </div>
        </div>

        {/* Citas */}
        <div className="col-md-4">
          <div className="card h-100 border-primary shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary text-white rounded-circle p-3 me-3">
                  <i className="bi bi-calendar-event-fill fs-4"></i>
                </div>
                <h5 className="card-title text-primary mb-0">Citas</h5>
              </div>
              <p className="card-text text-muted">Calendario y programación de citas</p>
              <button className="btn btn-primary w-100" onClick={() => navigate('/citas')}>
                Ir a Citas
              </button>
            </div>
          </div>
        </div>

        {/* Doctores */}
        <div className="col-md-4">
          <div className="card h-100 border-warning shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-warning text-white rounded-circle p-3 me-3">
                  <i className="bi bi-person-badge-fill fs-4"></i>
                </div>
                <h5 className="card-title text-warning mb-0">Doctores</h5>
              </div>
              <p className="card-text text-muted">Gestión de personal médico</p>
              <button className="btn btn-warning w-100" onClick={() => navigate('/doctores')}>
                Ir a Doctores
              </button>
            </div>
          </div>
        </div>

        {/* Consultas */}
        <div className="col-md-4">
          <div className="card h-100 border-secondary shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-secondary text-white rounded-circle p-3 me-3">
                  <i className="bi bi-clipboard2-pulse-fill fs-4"></i>
                </div>
                <h5 className="card-title text-secondary mb-0">Consultas</h5>
              </div>
              <p className="card-text text-muted">Ver historial de consultas médicas</p>
              <button className="btn btn-secondary w-100" onClick={() => navigate('/consultas')}>
                Ir a Consultas
              </button>
            </div>
          </div>
        </div>

        {/* Medicamentos */}
        <div className="col-md-4">
          <div className="card h-100 border-danger shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-danger text-white rounded-circle p-3 me-3">
                  <i className="bi bi-capsule-pill fs-4"></i>
                </div>
                <h5 className="card-title text-danger mb-0">Medicamentos</h5>
              </div>
              <p className="card-text text-muted">Inventario de medicamentos</p>
              <button className="btn btn-danger w-100" onClick={() => navigate('/medicamentos')}>
                Ir a Medicamentos
              </button>
            </div>
          </div>
        </div>

        {/* ✨ NUEVO: Especies */}
        <div className="col-md-4">
          <div className="card h-100 border-dark shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-dark text-white rounded-circle p-3 me-3">
                  <i className="bi bi-bookmarks-fill fs-4"></i>
                </div>
                <h5 className="card-title text-dark mb-0">Especies</h5>
              </div>
              <p className="card-text text-muted">Gestión de especies de animales</p>
              <button className="btn btn-dark w-100" onClick={() => navigate('/especies')}>
                Ir a Especies
              </button>
            </div>
          </div>
        </div>

        {/* ✨ NUEVO: Razas */}
        <div className="col-md-4">
          <div className="card h-100 border-primary shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary text-white rounded-circle p-3 me-3">
                  <i className="bi bi-list-stars fs-4"></i>
                </div>
                <h5 className="card-title text-primary mb-0">Razas</h5>
              </div>
              <p className="card-text text-muted">Gestión de razas por especie</p>
              <button className="btn btn-primary w-100" onClick={() => navigate('/razas')}>
                Ir a Razas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}