import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-primary">Panel de Control</h2>
          <p className="text-muted">Bienvenido <strong>{usuario?.nombre}</strong></p>
        </div>
        <button className="btn btn-outline-danger btn-sm" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 border-primary">
            <div className="card-body">
              <h5 className="card-title text-primary">Propietarios</h5>
              <p className="card-text">Administrar dueños de pacientes</p>
              <button className="btn btn-primary w-100" onClick={() => navigate('/propietarios')}>
                Ir a Propietarios
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-success">
            <div className="card-body">
              <h5 className="card-title text-success">Pacientes</h5>
              <p className="card-text">Gestionar información de las mascotas</p>
              <button className="btn btn-success w-100" onClick={() => navigate('/pacientes')}>
                Ir a Pacientes
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-info">
            <div className="card-body">
              <h5 className="card-title text-info">Citas</h5>
              <p className="card-text">Ver y agendar consultas</p>
              <button className="btn btn-info w-100 text-white" onClick={() => navigate('/citas')}>
                Ir a Citas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
