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
      setConsultas(data);
    } catch (error) {
      alert('Error al cargar el historial clínico');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-4">Cargando historial clínico...</p>;

  return (
    <div className="container mt-4">
      <h3 className="text-primary mb-3">
        Historial Clínico del Paciente #{idPaciente}
      </h3>

      {consultas.length === 0 ? (
        <div className="alert alert-secondary">
          No se encontraron consultas registradas para este paciente.
        </div>
      ) : (
        <table className="table table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Fecha y hora</th>
              <th>Doctor</th>
              <th>Diagnóstico</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{new Date(c.fecha_hora).toLocaleString()}</td>
                <td>{c.doctor || '—'}</td>
                <td>{c.diagnostico || 'Sin diagnóstico'}</td>
                <td>
                  <span
                    className={`badge ${
                      c.estado === 'Atendida'
                        ? 'bg-success'
                        : c.estado === 'Pendiente'
                        ? 'bg-warning text-dark'
                        : 'bg-secondary'
                    }`}
                  >
                    {c.estado}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/consulta/${c.id}`)}
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
