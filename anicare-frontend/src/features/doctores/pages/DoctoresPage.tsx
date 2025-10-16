// src/features/doctores/pages/DoctoresPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../shared/config/axiosConfig';

interface Doctor {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  dpi: string;
  telefono: string;
  correo: string;
  activo: boolean;
}

export default function DoctoresPage() {
  const navigate = useNavigate();
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/doctores');
      setDoctores(res.data);
    } catch (error) {
      console.error('Error al cargar doctores:', error);
      alert('Error al cargar los doctores');
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
          <p className="mt-2">Cargando doctores...</p>
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
            <i className="bi bi-person-badge-fill me-2"></i>
            Doctores
          </h3>
          <p className="text-muted mb-0">
            {doctores.length} doctor{doctores.length !== 1 ? 'es' : ''} registrado{doctores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Dashboard
          </button>
          <button className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Doctor
          </button>
        </div>
      </div>

      {/* Tabla de Doctores */}
      {doctores.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay doctores registrados en el sistema.
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">ID</th>
                    <th>Nombre Completo</th>
                    <th>Especialidad</th>
                    <th>DPI</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th className="pe-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {doctores.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="ps-3">
                        <strong>#{doctor.id}</strong>
                      </td>
                      <td>
                        <div className="fw-bold">
                          {doctor.nombre} {doctor.apellido}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {doctor.especialidad || 'No especificada'}
                        </span>
                      </td>
                      <td>{doctor.dpi || '—'}</td>
                      <td>{doctor.telefono || '—'}</td>
                      <td>{doctor.correo || '—'}</td>
                      <td>
                        {doctor.activo ? (
                          <span className="badge bg-success">Activo</span>
                        ) : (
                          <span className="badge bg-secondary">Inactivo</span>
                        )}
                      </td>
                      <td className="pe-3">
                        <button className="btn btn-sm btn-outline-primary me-1">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <i className="bi bi-trash"></i>
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

      {/* Estadísticas */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card border-success">
            <div className="card-body text-center">
              <h4 className="text-success mb-0">
                {doctores.filter(d => d.activo).length}
              </h4>
              <small className="text-muted">Doctores Activos</small>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-secondary">
            <div className="card-body text-center">
              <h4 className="text-secondary mb-0">
                {doctores.filter(d => !d.activo).length}
              </h4>
              <small className="text-muted">Doctores Inactivos</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}