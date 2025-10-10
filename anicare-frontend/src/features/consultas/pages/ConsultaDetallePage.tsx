// src/features/consultas/pages/ConsultaDetallePage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// 🧩 Importar servicios centralizados
import { obtenerConsultaPorId, actualizarConsulta } from '../services/consultaService';
import { obtenerDiagnosticosPorConsulta, actualizarDiagnostico } from '../../diagnosticos/services/diagnosticoService';
import { obtenerTratamientosPorConsulta, actualizarTratamiento } from '../../tratamientos/services/tratamientoService';

export default function ConsultaDetallePage() {
  const { idConsulta } = useParams<{ idConsulta: string }>();

  const [consulta, setConsulta] = useState<any>(null);
  const [diagnostico, setDiagnostico] = useState<any>(null);
  const [tratamiento, setTratamiento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Carga inicial
  useEffect(() => {
    if (idConsulta) cargarDatos();
  }, [idConsulta]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [consultaData, diagData, tratData] = await Promise.all([
        obtenerConsultaPorId(Number(idConsulta)),
        obtenerDiagnosticosPorConsulta(Number(idConsulta)),
        obtenerTratamientosPorConsulta(Number(idConsulta))
      ]);

      setConsulta(consultaData);
      setDiagnostico(diagData[0] || {});
      setTratamiento(tratData[0] || {});
    } catch (error) {
      console.error(error);
      alert('Error al cargar los datos del historial clínico');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Guardar cambios
  const guardarCambios = async () => {
    if (!consulta || !diagnostico || !tratamiento) {
      alert('No hay datos para guardar');
      return;
    }

    try {
      setSaving(true);
      await Promise.all([
        actualizarConsulta(consulta.id, consulta),
        actualizarDiagnostico(diagnostico.id, diagnostico),
        actualizarTratamiento(tratamiento.id, tratamiento)
      ]);
      alert('Historial clínico guardado correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Cargando datos...</p>;
  if (!consulta) return <p className="p-4">No se encontró la consulta.</p>;

  return (
    <div className="container mt-4">
      <h3 className="text-primary mb-4">Historial Clínico</h3>

      {/* Datos generales */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">Datos de la Consulta</div>
        <div className="card-body">
          <p><strong>ID:</strong> {consulta.id}</p>
          <p><strong>Paciente:</strong> {consulta.id_paciente}</p>
          <p><strong>Doctor:</strong> {consulta.id_doctor}</p>
          <p><strong>Fecha:</strong> {new Date(consulta.fecha_hora).toLocaleString()}</p>

          <div className="mb-3">
            <label className="form-label">Estado</label>
            <select
              className="form-select"
              value={consulta.estado || ''}
              onChange={(e) => setConsulta({ ...consulta, estado: e.target.value })}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Atendida">Atendida</option>
              <option value="Cerrada">Cerrada</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Notas adicionales</label>
            <textarea
              className="form-control"
              value={consulta.notas_adicionales || ''}
              onChange={(e) => setConsulta({ ...consulta, notas_adicionales: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">Diagnóstico</div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Diagnóstico</label>
            <input
              type="text"
              className="form-control"
              value={diagnostico?.nombre || ''}
              onChange={(e) => setDiagnostico({ ...diagnostico, nombre: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Comentarios</label>
            <textarea
              className="form-control"
              value={diagnostico?.comentarios || ''}
              onChange={(e) => setDiagnostico({ ...diagnostico, comentarios: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Tratamiento */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">Tratamiento</div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Medicamento</label>
            <input
              type="text"
              className="form-control"
              value={tratamiento?.nombre || ''}
              onChange={(e) => setTratamiento({ ...tratamiento, nombre: e.target.value })}
            />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Dosis</label>
              <input
                type="text"
                className="form-control"
                value={tratamiento?.dosis || ''}
                onChange={(e) => setTratamiento({ ...tratamiento, dosis: e.target.value })}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Frecuencia</label>
              <input
                type="text"
                className="form-control"
                value={tratamiento?.frecuencia || ''}
                onChange={(e) => setTratamiento({ ...tratamiento, frecuencia: e.target.value })}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Duración</label>
              <input
                type="text"
                className="form-control"
                value={tratamiento?.duracion || ''}
                onChange={(e) => setTratamiento({ ...tratamiento, duracion: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Instrucciones</label>
            <textarea
              className="form-control"
              value={tratamiento?.instrucciones || ''}
              onChange={(e) => setTratamiento({ ...tratamiento, instrucciones: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="text-end">
        <button className="btn btn-primary me-2" onClick={cargarDatos}>
          Recargar
        </button>
        <button
          className="btn btn-success"
          onClick={guardarCambios}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
