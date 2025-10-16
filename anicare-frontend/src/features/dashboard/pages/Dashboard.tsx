import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useEffect, useState } from 'react';
import axiosInstance from '../../../shared/config/axiosConfig';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para estadísticas
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
      
      // Obtener todas las estadísticas en paralelo
      const [citasRes, consultasRes, pacientesRes] = await Promise.all([
        axiosInstance.get('/citas'),
        axiosInstance.get('/consultas/todas'),
        axiosInstance.get('/pacientes')
      ]);

      const citas = citasRes.data;
      const consultas = consultasRes.data;
      const pacientes = pacientesRes.data;

      // Obtener fecha de hoy en Guatemala (zona horaria local)
      const ahora = new Date();
      const año = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const dia = String(ahora.getDate()).padStart(2, '0');
      const hoy = `${año}-${mes}-${dia}`;

      console.log('Fecha hoy:', hoy); // Debug

      // Calcular citas de hoy
      const citasHoy = citas.filter((cita: any) => {
        const fechaCita = cita.fecha_hora.split('T')[0]; // "2025-10-15"
        console.log('Comparando:', fechaCita, 'con', hoy); // Debug
        return fechaCita === hoy;
      }).length;

      // Calcular consultas realizadas hoy
      const consultasHoy = consultas.filter((consulta: any) => {
        const fechaConsulta = consulta.fecha_hora.split('T')[0];
        return fechaConsulta === hoy && consulta.estado === 'Finalizada';
      }).length;

      // Calcular citas pendientes
      const citasPendientes = citas.filter((cita: any) => cita.estado === 'Pendiente').length;

      console.log('Estadísticas:', { citasHoy, consultasHoy, citasPendientes }); // Debug

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
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-primary">Panel de Control - AniCare</h2>
          <p className="text-muted">Bienvenido <strong>{usuario?.nombre}</strong></p>
        </div>
        <button className="btn btn-outline-danger btn-sm" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      <div className="row g-4">
        {/* Propietarios */}
        <div className="col-md-4">
          <div className="card h-100 border-primary shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary text-white rounded-circle p-3 me-3">
                  <i className="bi bi-person-fill fs-4"></i>
                </div>
                <h5 className="card-title text-primary mb-0">Propietarios</h5>
              </div>
              <p className="card-text text-muted">Administrar dueños de pacientes</p>
              <button className="btn btn-primary w-100" onClick={() => navigate('/propietarios')}>
                Ir a Propietarios
              </button>
            </div>
          </div>
        </div>

        {/* Pacientes */}
        <div className="col-md-4">
          <div className="card h-100 border-success shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success text-white rounded-circle p-3 me-3">
                  <i className="bi bi-heart-pulse-fill fs-4"></i>
                </div>
                <h5 className="card-title text-success mb-0">Pacientes</h5>
              </div>
              <p className="card-text text-muted">Gestionar información de las mascotas</p>
              <button className="btn btn-success w-100" onClick={() => navigate('/pacientes')}>
                Ir a Pacientes
              </button>
            </div>
          </div>
        </div>

        {/* Doctores */}
        <div className="col-md-4">
          <div className="card h-100 border-warning shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-warning text-dark rounded-circle p-3 me-3">
                  <i className="bi bi-person-badge-fill fs-4"></i>
                </div>
                <h5 className="card-title text-warning mb-0">Doctores</h5>
              </div>
              <p className="card-text text-muted">Gestionar veterinarios de la clínica</p>
              <button className="btn btn-warning w-100" onClick={() => navigate('/doctores')}>
                Ir a Doctores
              </button>
            </div>
          </div>
        </div>

        {/* Citas */}
        <div className="col-md-4">
          <div className="card h-100 border-info shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-info text-white rounded-circle p-3 me-3">
                  <i className="bi bi-calendar-check-fill fs-4"></i>
                </div>
                <h5 className="card-title text-info mb-0">Citas</h5>
              </div>
              <p className="card-text text-muted">Ver calendario y gestionar citas</p>
              <button className="btn btn-info w-100 text-white" onClick={() => navigate('/citas')}>
                Ir a Citas
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
      </div>

      {/* Estadísticas rápidas */}
      <div className="row mt-5">
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
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="p-3">
                      <h3 className="text-info">{estadisticas.citasHoy}</h3>
                      <p className="text-muted mb-0">Citas hoy</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <h3 className="text-success">{estadisticas.consultasRealizadas}</h3>
                      <p className="text-muted mb-0">Consultas realizadas hoy</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <h3 className="text-warning">{estadisticas.citasPendientes}</h3>
                      <p className="text-muted mb-0">Citas pendientes</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <h3 className="text-primary">{estadisticas.totalPacientes}</h3>
                      <p className="text-muted mb-0">Pacientes registrados</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
