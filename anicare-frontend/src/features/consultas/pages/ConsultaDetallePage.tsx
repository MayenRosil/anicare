// src/features/consultas/pages/ConsultaDetallePage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerConsultaCompleta, actualizarConsulta, finalizarConsulta } from '../services/consultaService';
import { obtenerDiagnosticosPorConsulta, actualizarDiagnostico } from '../../diagnosticos/services/diagnosticoService';
import { obtenerTratamientosPorConsulta, actualizarTratamiento } from '../../tratamientos/services/tratamientoService';
import { obtenerMedicamentos } from '../../medicamentos/services/medicamentoService';
import axiosInstance from '../../../shared/config/axiosConfig';

export default function ConsultaDetallePage() {
  const { idConsulta } = useParams<{ idConsulta: string }>();
  const navigate = useNavigate();

  const [consultaCompleta, setConsultaCompleta] = useState<any>(null);
  const [diagnosticos, setDiagnosticos] = useState<any[]>([]);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (idConsulta) cargarDatos();
  }, [idConsulta]);

const cargarDatos = async () => {
  try {
    setLoading(true);
    
    console.log('📥 Iniciando carga de datos...');
    
    // 1. Cargar consulta, diagnósticos y medicamentos en paralelo
    const [consultaData, diagData, medsData] = await Promise.all([
      obtenerConsultaCompleta(Number(idConsulta)),
      obtenerDiagnosticosPorConsulta(Number(idConsulta)),
      obtenerMedicamentos()
    ]);

    console.log('📋 Diagnósticos obtenidos:', diagData);

    setConsultaCompleta(consultaData);
    setMedicamentos(medsData);
    
    // 2. Cargar TODOS los tratamientos de la consulta UNA SOLA VEZ
    const todosTratamientos = await obtenerTratamientosPorConsulta(Number(idConsulta));
    console.log('💊 TODOS los tratamientos obtenidos:', todosTratamientos);
    
    // 3. Mapear diagnósticos con sus tratamientos
    const diagsConTrats = diagData.map((diag: any) => {
      // Filtrar tratamientos que pertenecen a ESTE diagnóstico específico
      const tratDelDiag = todosTratamientos.filter(
        (t: any) => t.id_diagnostico_consulta === diag.id
      );
      
      // 🔧 FIX: Ordenar tratamientos por ID para mantener consistencia
      const tratamientosOrdenados = tratDelDiag.sort((a: any, b: any) => a.id - b.id);
      
      console.log(`  🔬 Diagnóstico ${diag.id} - Tratamientos encontrados:`, tratamientosOrdenados);
      
      return {
        ...diag,
        tratamientos: tratamientosOrdenados.length > 0 ? tratamientosOrdenados : [crearTratamientoVacio(diag.id)]
      };
    });

    console.log('✅ Diagnósticos con tratamientos mapeados:', diagsConTrats);
    setDiagnosticos(diagsConTrats);
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    alert('Error al cargar los datos de la consulta');
  } finally {
    setLoading(false);
  }
};

  const crearTratamientoVacio = (idDiagConsulta: number) => ({
    id: null,
    id_diagnostico_consulta: idDiagConsulta,
    id_medicamento: null,
    dosis: '',
    frecuencia: '',
    duracion: '',
    instrucciones: ''
  });

const agregarDiagnostico = () => {
  // 🔧 FIX: NO crear en BD inmediatamente, solo agregar al estado
  // Se guardará cuando el usuario haga clic en "Guardar Cambios"
  const nuevoDiag = {
    id: null, // ← Sin ID, se creará al guardar
    id_consulta: Number(idConsulta),
    id_diagnostico: 1,
    tipo: 'Secundario',
    estado: 'Activo',
    comentarios: '',
    tratamientos: [{
      id: null,
      id_diagnostico_consulta: null, // ← Se asignará cuando se guarde el diagnóstico
      id_medicamento: null,
      dosis: '',
      frecuencia: '',
      duracion: '',
      instrucciones: ''
    }]
  };

  setDiagnosticos([...diagnosticos, nuevoDiag]);
  console.log('✅ Diagnóstico temporal agregado (se guardará al hacer clic en Guardar)');
};

const agregarTratamiento = async (indexDiag: number) => {
  const diag = diagnosticos[indexDiag];
  
  try {
    // 🔧 FIX: NO crear en BD inmediatamente, solo agregar al estado
    // Se guardará cuando el usuario haga clic en "Guardar Cambios"
    const nuevoTrat = {
      id: null, // ← Sin ID, se creará al guardar
      id_diagnostico_consulta: diag.id,
      id_medicamento: null,
      dosis: '',
      frecuencia: '',
      duracion: '',
      instrucciones: ''
    };

    const nuevosDiags = [...diagnosticos];
    nuevosDiags[indexDiag].tratamientos.push(nuevoTrat);
    setDiagnosticos(nuevosDiags);
    
    console.log(`✅ Tratamiento temporal agregado al Diagnóstico ${indexDiag + 1} (se guardará al hacer clic en Guardar)`);
  } catch (error) {
    alert('Error al agregar tratamiento');
    console.error(error);
  }
};

const guardarCambios = async () => {
  if (!consultaCompleta) return;
  
  try {
    setSaving(true);

    console.log('🔍 ANTES DE GUARDAR - Estado de diagnósticos:', JSON.parse(JSON.stringify(diagnosticos)));

    // 1. Guardar consulta
    await actualizarConsulta(Number(idConsulta), {
      motivo_consulta: consultaCompleta.motivo_consulta,
      peso: consultaCompleta.peso,
      temperatura: consultaCompleta.temperatura,
      frecuencia_cardiaca: consultaCompleta.frecuencia_cardiaca,
      frecuencia_respiratoria: consultaCompleta.frecuencia_respiratoria,
      notas_adicionales: consultaCompleta.notas_adicionales
    });

    // 2. Guardar diagnósticos y tratamientos SECUENCIALMENTE
    for (let i = 0; i < diagnosticos.length; i++) {
      const diag = diagnosticos[i];
      console.log(`\n📋 Procesando Diagnóstico ${i + 1}:`, {
        id: diag.id,
        tipo: diag.tipo,
        comentarios: diag.comentarios,
        numTratamientos: diag.tratamientos.length
      });

      if (diag.id) {
        // Actualizar diagnóstico existente
        await actualizarDiagnostico(diag.id, {
          comentarios: diag.comentarios,
          tipo: diag.tipo,
          estado: diag.estado
        });

        // Guardar tratamientos del diagnóstico SECUENCIALMENTE
        for (let j = 0; j < diag.tratamientos.length; j++) {
          const trat = diag.tratamientos[j];
          console.log(`  💊 Tratamiento ${j + 1} del Diagnóstico ${i + 1}:`, {
            id: trat.id,
            id_diagnostico_consulta: trat.id_diagnostico_consulta,
            id_medicamento: trat.id_medicamento,
            dosis: trat.dosis,
            frecuencia: trat.frecuencia,
            duracion: trat.duracion,
            instrucciones: trat.instrucciones?.substring(0, 30)
          });

          if (trat.id) {
            // Actualizar tratamiento existente
            await actualizarTratamiento(trat.id, {
              id_medicamento: trat.id_medicamento,
              dosis: trat.dosis,
              frecuencia: trat.frecuencia,
              duracion: trat.duracion,
              instrucciones: trat.instrucciones
            });
          } else {
            // Crear nuevo tratamiento
            const res = await axiosInstance.post('/tratamientos', {
              id_diagnostico_consulta: diag.id,
              id_medicamento: trat.id_medicamento,
              dosis: trat.dosis,
              frecuencia: trat.frecuencia,
              duracion: trat.duracion,
              instrucciones: trat.instrucciones
            });
            trat.id = res.data.id;
            console.log(`    ✅ Tratamiento creado con ID: ${trat.id}`);
          }
        }
      } else {
        // Crear nuevo diagnóstico
        const resDiag = await axiosInstance.post('/diagnosticos', {
          id_consulta: Number(idConsulta),
          id_diagnostico: 1,
          tipo: diag.tipo,
          estado: diag.estado,
          comentarios: diag.comentarios
        });
        diag.id = resDiag.data.id;
        console.log(`  ✅ Diagnóstico creado con ID: ${diag.id}`);

        // Crear tratamientos del nuevo diagnóstico
        for (let j = 0; j < diag.tratamientos.length; j++) {
          const trat = diag.tratamientos[j];
          const resTrat = await axiosInstance.post('/tratamientos', {
            id_diagnostico_consulta: diag.id,
            id_medicamento: trat.id_medicamento,
            dosis: trat.dosis,
            frecuencia: trat.frecuencia,
            duracion: trat.duracion,
            instrucciones: trat.instrucciones
          });
          trat.id = resTrat.data.id;
          console.log(`    ✅ Tratamiento creado con ID: ${trat.id}`);
        }
      }
    }

    alert('Cambios guardados correctamente');
    console.log('🔄 Recargando datos...');
    await cargarDatos();
  } catch (error) {
    alert('Error al guardar los cambios');
    console.error('❌ Error:', error);
  } finally {
    setSaving(false);
  }
};

  const handleFinalizarConsulta = async () => {
    if (!confirm('¿Está seguro de finalizar esta consulta? No podrá editarla después.')) return;

    try {
      await finalizarConsulta(Number(idConsulta));
      alert('Consulta finalizada correctamente');
      navigate(`/paciente/${consultaCompleta.id_paciente}/historial`);
    } catch (error) {
      alert('Error al finalizar la consulta');
      console.error(error);
    }
  };

  if (loading) return <p className="p-4">Cargando información de la consulta...</p>;
  if (!consultaCompleta) return <p className="p-4">No se encontró la consulta</p>;

  const esFinalizada = consultaCompleta.estado === 'Finalizada';

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary mb-1">Consulta Médica #{idConsulta}</h3>
          <p className="text-muted mb-0">
            {new Date(consultaCompleta.fecha_hora).toLocaleString('es-GT')}
            <span className={`badge ms-2 ${
              consultaCompleta.estado === 'Abierta' ? 'bg-warning text-dark' : 
              consultaCompleta.estado === 'Finalizada' ? 'bg-success' : 'bg-secondary'
            }`}>
              {consultaCompleta.estado}
            </span>
          </p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          {!esFinalizada && (
            <>
              <button className="btn btn-primary me-2" onClick={guardarCambios} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
              <button className="btn btn-success" onClick={handleFinalizarConsulta}>
                ✓ Finalizar Consulta
              </button>
            </>
          )}
        </div>
      </div>

      {/* Información del Paciente */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">📋 Información del Paciente</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Nombre:</strong> {consultaCompleta.paciente_nombre}</p>
              <p><strong>Especie:</strong> {consultaCompleta.especie_nombre}</p>
              <p><strong>Raza:</strong> {consultaCompleta.raza_nombre}</p>
              <p><strong>Sexo:</strong> {consultaCompleta.paciente_sexo === 'M' ? 'Macho' : 'Hembra'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Propietario:</strong> {consultaCompleta.propietario_nombre} {consultaCompleta.propietario_apellido}</p>
              <p><strong>Teléfono:</strong> {consultaCompleta.propietario_telefono}</p>
              <p><strong>Color:</strong> {consultaCompleta.paciente_color}</p>
              <p><strong>Fecha de Nacimiento:</strong> {new Date(consultaCompleta.paciente_fecha_nacimiento).toLocaleDateString('es-GT')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Doctor */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">👨‍⚕️ Doctor Tratante</h5>
        </div>
        <div className="card-body">
          <p><strong>Nombre:</strong> Dr(a). {consultaCompleta.doctor_nombre} {consultaCompleta.doctor_apellido}</p>
          <p><strong>Especialidad:</strong> {consultaCompleta.doctor_especialidad}</p>
          {consultaCompleta.cita_comentario && (
            <p><strong>Motivo de Cita:</strong> {consultaCompleta.cita_comentario}</p>
          )}
        </div>
      </div>

      {/* Motivo de Consulta y Signos Vitales */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0">🩺 Examen Clínico</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label"><strong>Motivo de Consulta</strong></label>
            <textarea
              className="form-control"
              rows={2}
              value={consultaCompleta.motivo_consulta || ''}
              onChange={(e) => setConsultaCompleta({ ...consultaCompleta, motivo_consulta: e.target.value })}
              disabled={esFinalizada}
              placeholder="Descripción del motivo de la consulta..."
            />
          </div>

          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label"><strong>Peso (kg)</strong></label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={consultaCompleta.peso || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, peso: parseFloat(e.target.value) })}
                disabled={esFinalizada}
                placeholder="0.00"
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label"><strong>Temperatura (°C)</strong></label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={consultaCompleta.temperatura || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, temperatura: parseFloat(e.target.value) })}
                disabled={esFinalizada}
                placeholder="38.5"
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label"><strong>Frec. Cardíaca (lpm)</strong></label>
              <input
                type="number"
                className="form-control"
                value={consultaCompleta.frecuencia_cardiaca || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, frecuencia_cardiaca: parseInt(e.target.value) })}
                disabled={esFinalizada}
                placeholder="120"
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label"><strong>Frec. Respiratoria (rpm)</strong></label>
              <input
                type="number"
                className="form-control"
                value={consultaCompleta.frecuencia_respiratoria || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, frecuencia_respiratoria: parseInt(e.target.value) })}
                disabled={esFinalizada}
                placeholder="30"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label"><strong>Observaciones Clínicas</strong></label>
            <textarea
              className="form-control"
              rows={3}
              value={consultaCompleta.notas_adicionales || ''}
              onChange={(e) => setConsultaCompleta({ ...consultaCompleta, notas_adicionales: e.target.value })}
              disabled={esFinalizada}
              placeholder="Hallazgos del examen físico, comportamiento del paciente, etc..."
            />
          </div>
        </div>
      </div>

      {/* Diagnósticos y Tratamientos */}
      <div className="card mb-4">
        <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">🔬 Diagnósticos y Tratamientos</h5>
          {!esFinalizada && (
            <button className="btn btn-light btn-sm" onClick={agregarDiagnostico}>
              + Agregar Diagnóstico
            </button>
          )}
        </div>
        <div className="card-body">
          {diagnosticos.length === 0 ? (
            <p className="text-muted">No hay diagnósticos registrados</p>
          ) : (
            diagnosticos.map((diag, indexDiag) => (
              <div key={diag.id || indexDiag} className="border rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="text-danger fw-bold mb-3">🔬 Diagnóstico {indexDiag + 1}</h6>
                
                {/* Diagnóstico */}
                <div className="mb-3">
                  <label className="form-label"><strong>Tipo:</strong></label>
                  <select
                    className="form-select"
                    value={diag.tipo || 'Principal'}
                    onChange={(e) => {
                      const nuevos = [...diagnosticos];
                      nuevos[indexDiag].tipo = e.target.value;
                      setDiagnosticos(nuevos);
                    }}
                    disabled={esFinalizada}
                  >
                    <option value="Principal">Principal</option>
                    <option value="Secundario">Secundario</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label"><strong>Estado:</strong></label>
                  <select
                    className="form-select"
                    value={diag.estado || 'Activo'}
                    onChange={(e) => {
                      const nuevos = [...diagnosticos];
                      nuevos[indexDiag].estado = e.target.value;
                      setDiagnosticos(nuevos);
                    }}
                    disabled={esFinalizada}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label"><strong>Comentarios del Diagnóstico</strong></label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={diag.comentarios || ''}
                    onChange={(e) => {
                      const nuevos = [...diagnosticos];
                      nuevos[indexDiag].comentarios = e.target.value;
                      setDiagnosticos(nuevos);
                    }}
                    disabled={esFinalizada}
                    placeholder="Detalles del diagnóstico..."
                  />
                </div>

                {/* Tratamientos del diagnóstico */}
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-success fw-bold mb-0">💊 Tratamientos</h6>
                    {!esFinalizada && (
                      <button 
                        className="btn btn-success btn-sm" 
                        onClick={() => agregarTratamiento(indexDiag)}
                      >
                        + Agregar Tratamiento
                      </button>
                    )}
                  </div>

                  {diag.tratamientos?.map((trat: any, indexTrat: number) => (
                    <div key={trat.id || indexTrat} className="border rounded p-3 mb-3" style={{ backgroundColor: '#ffffff' }}>
                      <h6 className="text-success mb-3">💊 Tratamiento {indexTrat + 1}</h6>
                      
                      <div className="mb-3">
                        <label className="form-label"><strong>Medicamento</strong></label>
                        <select
                          className="form-select"
                          value={trat.id_medicamento || ''}
                          onChange={(e) => {
                            const nuevos = [...diagnosticos];
                            nuevos[indexDiag].tratamientos[indexTrat].id_medicamento = parseInt(e.target.value);
                            setDiagnosticos(nuevos);
                          }}
                          disabled={esFinalizada}
                        >
                          <option value="">Seleccione un medicamento...</option>
                          {medicamentos.map((med: any) => (
                            <option key={med.id} value={med.id}>
                              {med.nombre} - {med.presentacion} ({med.laboratorio})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label"><strong>Dosis</strong></label>
                          <input
                            type="text"
                            className="form-control"
                            value={trat.dosis || ''}
                            onChange={(e) => {
                              const nuevos = [...diagnosticos];
                              nuevos[indexDiag].tratamientos[indexTrat].dosis = e.target.value;
                              setDiagnosticos(nuevos);
                            }}
                            disabled={esFinalizada}
                            placeholder="Ej: 10mg"
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label"><strong>Frecuencia</strong></label>
                          <input
                            type="text"
                            className="form-control"
                            value={trat.frecuencia || ''}
                            onChange={(e) => {
                              const nuevos = [...diagnosticos];
                              nuevos[indexDiag].tratamientos[indexTrat].frecuencia = e.target.value;
                              setDiagnosticos(nuevos);
                            }}
                            disabled={esFinalizada}
                            placeholder="Ej: Cada 8 horas"
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label"><strong>Duración</strong></label>
                          <input
                            type="text"
                            className="form-control"
                            value={trat.duracion || ''}
                            onChange={(e) => {
                              const nuevos = [...diagnosticos];
                              nuevos[indexDiag].tratamientos[indexTrat].duracion = e.target.value;
                              setDiagnosticos(nuevos);
                            }}
                            disabled={esFinalizada}
                            placeholder="Ej: 7 días"
                          />
                        </div>

                        <div className="col-md-12 mb-3">
                          <label className="form-label"><strong>Instrucciones</strong></label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={trat.instrucciones || ''}
                            onChange={(e) => {
                              const nuevos = [...diagnosticos];
                              nuevos[indexDiag].tratamientos[indexTrat].instrucciones = e.target.value;
                              setDiagnosticos(nuevos);
                            }}
                            disabled={esFinalizada}
                            placeholder="Instrucciones especiales para el tratamiento..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botones inferiores */}
      {!esFinalizada && (
        <div className="d-flex justify-content-end gap-2 mb-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={guardarCambios} disabled={saving}>
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
          <button className="btn btn-success" onClick={handleFinalizarConsulta}>
            ✓ Finalizar Consulta
          </button>
        </div>
      )}

      {esFinalizada && (
        <div className="alert alert-info">
          <strong>ℹ️ Información:</strong> Esta consulta ya fue finalizada y no puede ser modificada.
        </div>
      )}
    </div>
  );
}