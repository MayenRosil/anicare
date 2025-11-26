// src/features/consultas/pages/FichaClinicaPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../shared/config/axiosConfig';

interface Diagnostico {
  id?: number;
  id_consulta: number;
  id_diagnostico: number;
  comentarios: string; // ✨ ELIMINADOS: tipo, estado
  tratamientos: Tratamiento[];
}

interface Tratamiento {
  id?: number;
  id_diagnostico_consulta: number | null;
  id_medicamento: number;
  dosis: string;
  frecuencia: string;
  duracion: string;
  instrucciones: string;
}

export default function FichaClinicaPage() {
  const { idConsulta } = useParams<{ idConsulta: string }>();
  const [consulta, setConsulta] = useState<any>(null);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (idConsulta) cargarDatos();
  }, [idConsulta]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // 1. Cargar consulta
      const consultaRes = await axiosInstance.get(`/consultas/${idConsulta}`);
      setConsulta(consultaRes.data);

      // 2. Cargar diagnósticos
      const diagRes = await axiosInstance.get(`/diagnosticos/consulta/${idConsulta}`);
      const diagnosticosData = diagRes.data;

      // 3. Para cada diagnóstico, cargar sus tratamientos
      const diagnosticosConTratamientos = await Promise.all(
        diagnosticosData.map(async (diag: any) => {
          const tratRes = await axiosInstance.get(`/tratamientos/consulta/${idConsulta}`);
          const todosLosTratamientos = tratRes.data;
          
          // Filtrar solo los tratamientos de este diagnóstico
          const tratamientosDiag = todosLosTratamientos.filter(
            (t: any) => t.id_diagnostico_consulta === diag.id
          );

          return {
            ...diag,
            tratamientos: tratamientosDiag
          };
        })
      );

      setDiagnosticos(diagnosticosConTratamientos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar la ficha clínica');
    } finally {
      setLoading(false);
    }
  };

  // Guardar todos los cambios
  const guardarTodo = async () => {
    try {
      setSaving(true);

      // 1. Actualizar consulta (incluye los 14 campos nuevos)
      await axiosInstance.put(`/consultas/${consulta.id}`, consulta);

      // 2. Para cada diagnóstico
      for (const diag of diagnosticos) {
        if (diag.id) {
          // Actualizar diagnóstico existente (sin tipo/estado)
          await axiosInstance.put(`/diagnosticos/${diag.id}`, {
            id_diagnostico: diag.id_diagnostico,
            comentarios: diag.comentarios
          });
        } else {
          // Crear nuevo diagnóstico (sin tipo/estado)
          const diagRes = await axiosInstance.post('/diagnosticos', {
            id_consulta: Number(idConsulta),
            id_diagnostico: diag.id_diagnostico,
            comentarios: diag.comentarios
          });
          diag.id = diagRes.data.id;
        }

        // 3. Para cada tratamiento del diagnóstico
        for (const trat of diag.tratamientos) {
          trat.id_diagnostico_consulta = diag.id!;

          if (trat.id) {
            await axiosInstance.put(`/tratamientos/${trat.id}`, trat);
          } else {
            await axiosInstance.post('/tratamientos', trat);
          }
        }
      }

      alert('Datos guardados exitosamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  // Agregar nuevo diagnóstico
  const agregarDiagnostico = () => {
    setDiagnosticos([
      ...diagnosticos,
      {
        id_consulta: Number(idConsulta),
        id_diagnostico: 1,
        comentarios: '', // ✨ Sin tipo/estado
        tratamientos: [
          {
            id_diagnostico_consulta: null,
            id_medicamento: 1,
            dosis: '',
            frecuencia: '',
            duracion: '',
            instrucciones: ''
          }
        ]
      }
    ]);
  };

  // Agregar tratamiento a un diagnóstico
  const agregarTratamiento = (diagIndex: number) => {
    const nuevosDiagnosticos = [...diagnosticos];
    nuevosDiagnosticos[diagIndex].tratamientos.push({
      id_diagnostico_consulta: nuevosDiagnosticos[diagIndex].id || null,
      id_medicamento: 1,
      dosis: '',
      frecuencia: '',
      duracion: '',
      instrucciones: ''
    });
    setDiagnosticos(nuevosDiagnosticos);
  };

  // Actualizar diagnóstico
  const actualizarDiagnostico = (diagIndex: number, campo: string, valor: any) => {
    const nuevosDiagnosticos = [...diagnosticos];
    (nuevosDiagnosticos[diagIndex] as any)[campo] = valor;
    setDiagnosticos(nuevosDiagnosticos);
  };

  // Actualizar tratamiento
  const actualizarTratamiento = (
    diagIndex: number,
    tratIndex: number,
    campo: string,
    valor: any
  ) => {
    const nuevosDiagnosticos = [...diagnosticos];
    (nuevosDiagnosticos[diagIndex].tratamientos[tratIndex] as any)[campo] = valor;
    setDiagnosticos(nuevosDiagnosticos);
  };

  // Actualizar campo de consulta
  const actualizarCampoConsulta = (campo: string, valor: any) => {
    setConsulta({ ...consulta, [campo]: valor });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando ficha clínica...</p>
        </div>
      </div>
    );
  }

  if (!consulta) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          No se pudo cargar la consulta
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-primary">📋 Ficha Clínica</h3>
        <button
          className="btn btn-success"
          onClick={guardarTodo}
          disabled={saving}
        >
          {saving ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>
      </div>

      {/* Datos de la Consulta */}
      <div className="card mb-3">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">📄 Datos de la Consulta</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Paciente:</strong> {consulta.paciente_nombre || 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Doctor:</strong> {consulta.doctor_nombre || 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Fecha:</strong> {new Date(consulta.fecha_hora).toLocaleString()}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Estado:</strong> <span className={`badge ${consulta.estado === 'Finalizada' ? 'bg-success' : 'bg-warning'}`}>{consulta.estado}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Examen Clínico Básico */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #FFC107' }}>
        <div className="card-header" style={{ backgroundColor: '#FFC107' }}>
          <h5 className="mb-0">🩺 EXAMEN CLÍNICO</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Motivo de Consulta</label>
            <textarea
              className="form-control"
              rows={3}
              value={consulta.motivo_consulta || ''}
              onChange={(e) => actualizarCampoConsulta('motivo_consulta', e.target.value)}
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Peso (kg)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={consulta.peso || ''}
                onChange={(e) => actualizarCampoConsulta('peso', parseFloat(e.target.value))}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Temperatura (°C)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={consulta.temperatura || ''}
                onChange={(e) => actualizarCampoConsulta('temperatura', parseFloat(e.target.value))}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Frec. Cardíaca (lpm)</label>
              <input
                type="number"
                className="form-control"
                value={consulta.frecuencia_cardiaca || ''}
                onChange={(e) => actualizarCampoConsulta('frecuencia_cardiaca', parseInt(e.target.value))}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Frec. Respiratoria (rpm)</label>
              <input
                type="number"
                className="form-control"
                value={consulta.frecuencia_respiratoria || ''}
                onChange={(e) => actualizarCampoConsulta('frecuencia_respiratoria', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Observaciones Clínicas</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Hallazgos del examen físico, comportamiento del paciente, etc..."
              value={consulta.notas_adicionales || ''}
              onChange={(e) => actualizarCampoConsulta('notas_adicionales', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ✨ NUEVA SECCIÓN 1: ANAMNESIS */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #FFC107' }}>
        <div className="card-header" style={{ backgroundColor: '#FFC107' }}>
          <h5 className="mb-0">📝 ANAMNESIS</h5>
        </div>
        <div className="card-body">
          <label className="form-label">Anamnesis (Entorno, Ambiente, Contexto)</label>
          <textarea
            className="form-control"
            rows={6}
            placeholder="Descripción del entorno del paciente, cambios recientes en alimentación, comportamiento, etc."
            value={consulta.anamnesis || ''}
            onChange={(e) => actualizarCampoConsulta('anamnesis', e.target.value)}
          />
        </div>
      </div>

      {/* ✨ NUEVA SECCIÓN 2: HISTORIA CLÍNICA */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #17A2B8' }}>
        <div className="card-header" style={{ backgroundColor: '#17A2B8', color: 'white' }}>
          <h5 className="mb-0">📋 HISTORIA CLÍNICA</h5>
        </div>
        <div className="card-body">
          <label className="form-label">Historia Clínica (Medicamentos, Cirugías, Antecedentes)</label>
          <textarea
            className="form-control"
            rows={6}
            placeholder="Medicamentos actuales, cirugías previas, enfermedades crónicas, vacunaciones..."
            value={consulta.historia_clinica || ''}
            onChange={(e) => actualizarCampoConsulta('historia_clinica', e.target.value)}
          />
        </div>
      </div>

      {/* ✨ NUEVA SECCIÓN 3: SIGNOS VITALES ADICIONALES */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #28A745' }}>
        <div className="card-header" style={{ backgroundColor: '#28A745', color: 'white' }}>
          <h5 className="mb-0">❤️ SIGNOS VITALES ADICIONALES</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Pulso Arterial</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Fuerte, regular"
                value={consulta.pulso_arterial || ''}
                onChange={(e) => actualizarCampoConsulta('pulso_arterial', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">TLLC (Tiempo Llenado Capilar)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: < 2 segundos"
                value={consulta.tllc || ''}
                onChange={(e) => actualizarCampoConsulta('tllc', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Color de Mucosas</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Rosado pálido"
                value={consulta.color_mucosas || ''}
                onChange={(e) => actualizarCampoConsulta('color_mucosas', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ✨ NUEVA SECCIÓN 4: EVALUACIÓN GENERAL */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #007BFF' }}>
        <div className="card-header" style={{ backgroundColor: '#007BFF', color: 'white' }}>
          <h5 className="mb-0">👤 EVALUACIÓN GENERAL</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Condición Corporal (BCS)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: 4/9"
                value={consulta.condicion_corporal || ''}
                onChange={(e) => actualizarCampoConsulta('condicion_corporal', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Estado de Hidratación</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: < 2% pérdida"
                value={consulta.estado_hidratacion || ''}
                onChange={(e) => actualizarCampoConsulta('estado_hidratacion', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Estado Mental</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Alerta"
                value={consulta.estado_mental || ''}
                onChange={(e) => actualizarCampoConsulta('estado_mental', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ✨ NUEVA SECCIÓN 5: EXPLORACIÓN RESPIRATORIA */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #6C757D' }}>
        <div className="card-header" style={{ backgroundColor: '#6C757D', color: 'white' }}>
          <h5 className="mb-0">🫁 EXPLORACIÓN RESPIRATORIA</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Palmo-Percusión Torácica</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Ej: Sonido claro, resonante"
              value={consulta.palmo_percusion_toracica || ''}
              onChange={(e) => actualizarCampoConsulta('palmo_percusion_toracica', e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Auscultación Pulmonar</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Ej: Sonidos vesiculares normales"
              value={consulta.auscultacion_pulmonar || ''}
              onChange={(e) => actualizarCampoConsulta('auscultacion_pulmonar', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ✨ NUEVA SECCIÓN 6: REFLEJOS FISIOLÓGICOS */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #DC3545' }}>
        <div className="card-header" style={{ backgroundColor: '#DC3545', color: 'white' }}>
          <h5 className="mb-0">🔬 REFLEJOS FISIOLÓGICOS</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Reflejo Tusígeno</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Positivo"
                value={consulta.reflejo_tusigeno || ''}
                onChange={(e) => actualizarCampoConsulta('reflejo_tusigeno', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Reflejo Deglutorio</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Presente"
                value={consulta.reflejo_deglutorio || ''}
                onChange={(e) => actualizarCampoConsulta('reflejo_deglutorio', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ✨ NUEVA SECCIÓN 7: OTROS HALLAZGOS */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #6F42C1' }}>
        <div className="card-header" style={{ backgroundColor: '#6F42C1', color: 'white' }}>
          <h5 className="mb-0">🚶 OTROS HALLAZGOS</h5>
        </div>
        <div className="card-body">
          <label className="form-label">Postura y Marcha</label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Ej: Normal, sin cojera"
            value={consulta.postura_marcha || ''}
            onChange={(e) => actualizarCampoConsulta('postura_marcha', e.target.value)}
          />
        </div>
      </div>

      {/* ✨ NUEVA SECCIÓN 8: LABORATORIOS */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #FD7E14' }}>
        <div className="card-header" style={{ backgroundColor: '#FD7E14', color: 'white' }}>
          <h5 className="mb-0">🧪 LABORATORIOS REALIZADOS</h5>
        </div>
        <div className="card-body">
          <label className="form-label">Laboratorios Realizados</label>
          <textarea
            className="form-control"
            rows={6}
            placeholder="Nombre del laboratorio, resultados obtenidos, observaciones..."
            value={consulta.laboratorios || ''}
            onChange={(e) => actualizarCampoConsulta('laboratorios', e.target.value)}
          />
        </div>
      </div>

      {/* Diagnósticos y Tratamientos */}
      <div className="card mb-3" style={{ borderLeft: '4px solid #DC3545' }}>
        <div className="card-header" style={{ backgroundColor: '#DC3545', color: 'white' }}>
          <h5 className="mb-0">🩺 DIAGNÓSTICOS Y TRATAMIENTOS</h5>
        </div>
        <div className="card-body">
          <button
            className="btn btn-primary mb-3"
            onClick={agregarDiagnostico}
          >
            + Nuevo Diagnóstico
          </button>

          {diagnosticos.map((diag, diagIndex) => (
            <div key={diagIndex} className="card mb-3 border-danger">
              <div className="card-header bg-danger text-white">
                <h6 className="mb-0">🔬 Diagnóstico {diagIndex + 1}</h6>
              </div>
              <div className="card-body">
                {/* ✨ SIN TIPO NI ESTADO */}
                <div className="mb-3">
                  <label className="form-label">Comentarios del Diagnóstico</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Detalles del diagnóstico..."
                    value={diag.comentarios}
                    onChange={(e) => actualizarDiagnostico(diagIndex, 'comentarios', e.target.value)}
                  />
                </div>

                {/* Tratamientos */}
                <div className="mt-3">
                  <h6 className="text-success">💊 Tratamientos</h6>
                  <button
                    className="btn btn-sm btn-success mb-2"
                    onClick={() => agregarTratamiento(diagIndex)}
                  >
                    + Agregar Tratamiento
                  </button>

                  {diag.tratamientos.map((trat, tratIndex) => (
                    <div key={tratIndex} className="card mb-2 border-success">
                      <div className="card-body">
                        <h6 className="text-success">💊 Tratamiento {tratIndex + 1}</h6>
                        
                        <div className="mb-2">
                          <label className="form-label">Medicamento ID</label>
                          <input
                            type="number"
                            className="form-control"
                            value={trat.id_medicamento}
                            onChange={(e) => actualizarTratamiento(diagIndex, tratIndex, 'id_medicamento', parseInt(e.target.value))}
                          />
                        </div>

                        <div className="row">
                          <div className="col-md-4 mb-2">
                            <label className="form-label">Dosis</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ej: 10mg"
                              value={trat.dosis}
                              onChange={(e) => actualizarTratamiento(diagIndex, tratIndex, 'dosis', e.target.value)}
                            />
                          </div>
                          <div className="col-md-4 mb-2">
                            <label className="form-label">Frecuencia</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ej: Cada 8 horas"
                              value={trat.frecuencia}
                              onChange={(e) => actualizarTratamiento(diagIndex, tratIndex, 'frecuencia', e.target.value)}
                            />
                          </div>
                          <div className="col-md-4 mb-2">
                            <label className="form-label">Duración</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ej: 7 días"
                              value={trat.duracion}
                              onChange={(e) => actualizarTratamiento(diagIndex, tratIndex, 'duracion', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Instrucciones</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Instrucciones especiales para el tratamiento..."
                            value={trat.instrucciones}
                            onChange={(e) => actualizarTratamiento(diagIndex, tratIndex, 'instrucciones', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón Guardar Final */}
      <div className="text-center mb-4">
        <button
          className="btn btn-success btn-lg"
          onClick={guardarTodo}
          disabled={saving}
        >
          {saving ? 'Guardando...' : '💾 Guardar Todos los Cambios'}
        </button>
      </div>
    </div>
  );
}