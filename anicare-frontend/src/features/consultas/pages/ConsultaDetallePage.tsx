// src/features/consultas/pages/ConsultaDetallePage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerConsultaCompleta, actualizarConsulta, finalizarConsulta } from '../services/consultaService';
import { obtenerDiagnosticosPorConsulta, actualizarDiagnostico } from '../../diagnosticos/services/diagnosticoService';
import { obtenerTratamientosPorConsulta, actualizarTratamiento } from '../../tratamientos/services/tratamientoService';
import { obtenerMedicamentos } from '../../medicamentos/services/medicamentoService';
import axiosInstance from '../../../shared/config/axiosConfig';
import jsPDF from 'jspdf';

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
      
      // Ordenar tratamientos por ID para mantener consistencia
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
  const nuevoDiag = {
    id: null,
    id_consulta: Number(idConsulta),
    id_diagnostico: 1,
    comentarios: '',
    tratamientos: [{
      id: null,
      id_diagnostico_consulta: null,
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
    const nuevoTrat = {
      id: null,
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
    
    console.log(`✅ Tratamiento temporal agregado al Diagnóstico ${indexDiag + 1}`);
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

    // 1. Guardar consulta (incluye 14 campos nuevos)
    await actualizarConsulta(Number(idConsulta), {
      motivo_consulta: consultaCompleta.motivo_consulta,
      peso: consultaCompleta.peso,
      temperatura: consultaCompleta.temperatura,
      frecuencia_cardiaca: consultaCompleta.frecuencia_cardiaca,
      frecuencia_respiratoria: consultaCompleta.frecuencia_respiratoria,
      notas_adicionales: consultaCompleta.notas_adicionales,
      anamnesis: consultaCompleta.anamnesis,
      historia_clinica: consultaCompleta.historia_clinica,
      pulso_arterial: consultaCompleta.pulso_arterial,
      tllc: consultaCompleta.tllc,
      color_mucosas: consultaCompleta.color_mucosas,
      condicion_corporal: consultaCompleta.condicion_corporal,
      estado_hidratacion: consultaCompleta.estado_hidratacion,
      estado_mental: consultaCompleta.estado_mental,
      palmo_percusion_toracica: consultaCompleta.palmo_percusion_toracica,
      auscultacion_pulmonar: consultaCompleta.auscultacion_pulmonar,
      reflejo_tusigeno: consultaCompleta.reflejo_tusigeno,
      reflejo_deglutorio: consultaCompleta.reflejo_deglutorio,
      postura_marcha: consultaCompleta.postura_marcha,
      laboratorios: consultaCompleta.laboratorios
    });

    // 2. Guardar diagnósticos y tratamientos SECUENCIALMENTE
    for (let i = 0; i < diagnosticos.length; i++) {
      const diag = diagnosticos[i];
      console.log(`\n📋 Procesando Diagnóstico ${i + 1}:`, {
        id: diag.id,
        comentarios: diag.comentarios,
        numTratamientos: diag.tratamientos.length
      });

      if (diag.id) {
        await actualizarDiagnostico(diag.id, {
          comentarios: diag.comentarios
        });

        for (let j = 0; j < diag.tratamientos.length; j++) {
          const trat = diag.tratamientos[j];
          console.log(`  💊 Tratamiento ${j + 1} del Diagnóstico ${i + 1}:`, {
            id: trat.id,
            id_diagnostico_consulta: trat.id_diagnostico_consulta,
            id_medicamento: trat.id_medicamento,
            dosis: trat.dosis
          });

          if (trat.id) {
            await actualizarTratamiento(trat.id, {
              id_medicamento: trat.id_medicamento,
              dosis: trat.dosis,
              frecuencia: trat.frecuencia,
              duracion: trat.duracion,
              instrucciones: trat.instrucciones
            });
          } else {
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
        const resDiag = await axiosInstance.post('/diagnosticos', {
          id_consulta: Number(idConsulta),
          id_diagnostico: 1,
          comentarios: diag.comentarios
        });
        diag.id = resDiag.data.id;
        console.log(`  ✅ Diagnóstico creado con ID: ${diag.id}`);

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
  if (!confirm('¿Está seguro de finalizar esta consulta? Primero se guardarán todos los cambios. Esta acción no se puede deshacer.')) {
    return;
  }

  if (!consultaCompleta) {
    alert('No se puede finalizar una consulta sin datos');
    return;
  }

  try {
    setSaving(true);

    console.log('💾 Paso 1/4: Guardando datos de la consulta...');
    await actualizarConsulta(Number(idConsulta), {
      motivo_consulta: consultaCompleta.motivo_consulta,
      peso: consultaCompleta.peso,
      temperatura: consultaCompleta.temperatura,
      frecuencia_cardiaca: consultaCompleta.frecuencia_cardiaca,
      frecuencia_respiratoria: consultaCompleta.frecuencia_respiratoria,
      notas_adicionales: consultaCompleta.notas_adicionales,
      anamnesis: consultaCompleta.anamnesis,
      historia_clinica: consultaCompleta.historia_clinica,
      pulso_arterial: consultaCompleta.pulso_arterial,
      tllc: consultaCompleta.tllc,
      color_mucosas: consultaCompleta.color_mucosas,
      condicion_corporal: consultaCompleta.condicion_corporal,
      estado_hidratacion: consultaCompleta.estado_hidratacion,
      estado_mental: consultaCompleta.estado_mental,
      palmo_percusion_toracica: consultaCompleta.palmo_percusion_toracica,
      auscultacion_pulmonar: consultaCompleta.auscultacion_pulmonar,
      reflejo_tusigeno: consultaCompleta.reflejo_tusigeno,
      reflejo_deglutorio: consultaCompleta.reflejo_deglutorio,
      postura_marcha: consultaCompleta.postura_marcha,
      laboratorios: consultaCompleta.laboratorios
    });

    console.log('💾 Paso 2/4: Guardando diagnósticos...');
    for (let i = 0; i < diagnosticos.length; i++) {
      const diag = diagnosticos[i];
      
      if (diag.id) {
        await actualizarDiagnostico(diag.id, {
          comentarios: diag.comentarios
        });

        for (let j = 0; j < diag.tratamientos.length; j++) {
          const trat = diag.tratamientos[j];
          
          if (trat.id) {
            await actualizarTratamiento(trat.id, {
              id_medicamento: trat.id_medicamento,
              dosis: trat.dosis,
              frecuencia: trat.frecuencia,
              duracion: trat.duracion,
              instrucciones: trat.instrucciones
            });
          } else {
            await axiosInstance.post('/tratamientos', {
              id_diagnostico_consulta: diag.id,
              id_medicamento: trat.id_medicamento,
              dosis: trat.dosis,
              frecuencia: trat.frecuencia,
              duracion: trat.duracion,
              instrucciones: trat.instrucciones
            });
          }
        }
      } else {
        const resDiag = await axiosInstance.post('/diagnosticos', {
          id_consulta: Number(idConsulta),
          id_diagnostico: 1,
          comentarios: diag.comentarios
        });
        
        for (let j = 0; j < diag.tratamientos.length; j++) {
          const trat = diag.tratamientos[j];
          await axiosInstance.post('/tratamientos', {
            id_diagnostico_consulta: resDiag.data.id,
            id_medicamento: trat.id_medicamento,
            dosis: trat.dosis,
            frecuencia: trat.frecuencia,
            duracion: trat.duracion,
            instrucciones: trat.instrucciones
          });
        }
      }
    }

    console.log('✅ Paso 3/4: Finalizando consulta (cambiando estado)...');
    await finalizarConsulta(Number(idConsulta));

    console.log('✅ Paso 4/4: Redirigiendo al historial...');
    alert('✅ Consulta guardada y finalizada correctamente');
    navigate(`/paciente/${consultaCompleta.id_paciente}/historial`);
    
  } catch (error) {
    console.error('❌ Error al finalizar la consulta:', error);
    alert('❌ Error al finalizar la consulta. Por favor intente nuevamente.');
  } finally {
    setSaving(false);
  }
};

// 📄 FUNCIÓN PARA GENERAR RECETA EN PDF
const generarRecetaPDF = () => {
  if (!consultaCompleta || diagnosticos.length === 0) {
    alert('No hay diagnósticos ni tratamientos para generar la receta');
    return;
  }

  const doc = new jsPDF();
  let yPos = 20;

  // Header - Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RECETA MÉDICA VETERINARIA', 105, yPos, { align: 'center' });
  yPos += 10;

  // Línea separadora
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  // Información del Paciente
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PACIENTE:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(consultaCompleta.paciente_nombre || 'N/A', 50, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('ESPECIE:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${consultaCompleta.especie_nombre || 'N/A'} - ${consultaCompleta.raza_nombre || 'N/A'}`, 50, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('PROPIETARIO:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${consultaCompleta.propietario_nombre || ''} ${consultaCompleta.propietario_apellido || ''}`, 50, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('DOCTOR:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dr(a). ${consultaCompleta.doctor_nombre || ''} ${consultaCompleta.doctor_apellido || ''}`, 50, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('FECHA:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(consultaCompleta.fecha_hora).toLocaleDateString('es-GT'), 50, yPos);
  yPos += 10;

  // Línea separadora
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  // DIAGNÓSTICOS Y TRATAMIENTOS
  diagnosticos.forEach((diag, index) => {
    // Verificar si necesitamos nueva página
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Diagnóstico
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`DIAGNÓSTICO ${index + 1}:`, 20, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const comentariosDiag = diag.comentarios || 'Sin comentarios';
    const lineasDiag = doc.splitTextToSize(comentariosDiag, 170);
    doc.text(lineasDiag, 20, yPos);
    yPos += lineasDiag.length * 5 + 5;

    // Tratamientos
    if (diag.tratamientos && diag.tratamientos.length > 0) {
      diag.tratamientos.forEach((trat: any, tratIndex: number) => {
        // Buscar nombre del medicamento
        const med = medicamentos.find((m: any) => m.id === trat.id_medicamento);
        const nombreMed = med ? `${med.nombre} - ${med.presentacion}` : 'Medicamento no especificado';

        // Verificar espacio
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(`   Tratamiento ${tratIndex + 1}:`, 20, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        doc.text(`   • Medicamento: ${nombreMed}`, 20, yPos);
        yPos += 5;
        doc.text(`   • Dosis: ${trat.dosis || 'N/A'}`, 20, yPos);
        yPos += 5;
        doc.text(`   • Frecuencia: ${trat.frecuencia || 'N/A'}`, 20, yPos);
        yPos += 5;
        doc.text(`   • Duración: ${trat.duracion || 'N/A'}`, 20, yPos);
        yPos += 5;

        if (trat.instrucciones && trat.instrucciones.trim()) {
          doc.text(`   • Instrucciones:`, 20, yPos);
          yPos += 5;
          const lineasInst = doc.splitTextToSize(trat.instrucciones, 160);
          doc.text(lineasInst, 25, yPos);
          yPos += lineasInst.length * 5;
        }

        yPos += 3;
      });
    }

    yPos += 5;
  });

  // Espacio para firma
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 20;
  doc.setLineWidth(0.3);
  doc.line(70, yPos, 140, yPos);
  yPos += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Firma y Sello del Médico Veterinario', 105, yPos, { align: 'center' });

  // Footer
  const numPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= numPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receta generada el ${new Date().toLocaleString('es-GT')}`, 105, 285, { align: 'center' });
    doc.text(`Página ${i} de ${numPaginas}`, 190, 285, { align: 'right' });
  }

  // Guardar PDF
  const nombreArchivo = `Receta_${consultaCompleta.paciente_nombre}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);
  
  console.log('✅ Receta PDF generada exitosamente');
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
          {/* 📄 BOTÓN GENERAR RECETA */}
          <button 
            className="btn btn-outline-info me-2" 
            onClick={generarRecetaPDF}
            disabled={diagnosticos.length === 0}
          >
            📄 Generar Receta
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

      {/* Anamnesis */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0">📝 Anamnesis</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label"><strong>Anamnesis (Entorno, Ambiente, Contexto)</strong></label>
            <textarea
              className="form-control"
              rows={4}
              value={consultaCompleta.anamnesis || ''}
              onChange={(e) => setConsultaCompleta({ ...consultaCompleta, anamnesis: e.target.value })}
              disabled={esFinalizada}
              placeholder="Descripción del entorno del paciente, cambios recientes en alimentación, comportamiento, etc..."
            />
          </div>
        </div>
      </div>

      {/* Historia Clínica */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">📋 Historia Clínica</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label"><strong>Historia Clínica (Medicamentos, Cirugías, Antecedentes)</strong></label>
            <textarea
              className="form-control"
              rows={4}
              value={consultaCompleta.historia_clinica || ''}
              onChange={(e) => setConsultaCompleta({ ...consultaCompleta, historia_clinica: e.target.value })}
              disabled={esFinalizada}
              placeholder="Medicamentos actuales, cirugías previas, enfermedades crónicas, vacunaciones..."
            />
          </div>
        </div>
      </div>

      {/* Signos Vitales Adicionales */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">❤️ Signos Vitales Adicionales</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label"><strong>Pulso Arterial</strong></label>
              <input
                type="text"
                className="form-control"
                value={consultaCompleta.pulso_arterial || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, pulso_arterial: e.target.value })}
                disabled={esFinalizada}
                placeholder="Ej: Fuerte, regular"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label"><strong>TLLC (Tiempo Llenado Capilar)</strong></label>
              <input
                type="text"
                className="form-control"
                value={consultaCompleta.tllc || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, tllc: e.target.value })}
                disabled={esFinalizada}
                placeholder="Ej: < 2 segundos"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label"><strong>Color de Mucosas</strong></label>
              <input
                type="text"
                className="form-control"
                value={consultaCompleta.color_mucosas || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, color_mucosas: e.target.value })}
                disabled={esFinalizada}
                placeholder="Ej: Rosado pálido"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Evaluación General */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">👤 Evaluación General</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label"><strong>Condición Corporal (BCS)</strong></label>
              <input
                type="text"
                className="form-control"
                value={consultaCompleta.condicion_corporal || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, condicion_corporal: e.target.value })}
                disabled={esFinalizada}
                placeholder="Ej: 4/9"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label"><strong>Estado de Hidratación</strong></label>
              <input
                type="text"
                className="form-control"
                value={consultaCompleta.estado_hidratacion || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, estado_hidratacion: e.target.value })}
                disabled={esFinalizada}
                placeholder="Ej: < 2% pérdida"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label"><strong>Estado Mental</strong></label>
              <input
                type="text"
                className="form-control"
                value={consultaCompleta.estado_mental || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, estado_mental: e.target.value })}
                disabled={esFinalizada}
                placeholder="Ej: Alerta"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exploración Respiratoria */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">🫁 Exploración Respiratoria</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label"><strong>Palmo-Percusión Torácica</strong></label>
            <textarea
              className="form-control"
              rows={3}
              value={consultaCompleta.palmo_percusion_toracica || ''}
              onChange={(e) => setConsultaCompleta({ ...consultaCompleta, palmo_percusion_toracica: e.target.value })}
              disabled={esFinalizada}
              placeholder="Ej: Sonido claro, resonante"
            />
          </div>

          <div className="mb-3">
            <label className="form-label"><strong>Auscultación Pulmonar</strong></label>
            <textarea
              className="form-control"
              rows={3}
              value={consultaCompleta.auscultacion_pulmonar || ''}
              onChange={(e) => setConsultaCompleta({ ...consultaCompleta, auscultacion_pulmonar: e.target.value })}
              disabled={esFinalizada}
              placeholder="Ej: Sonidos vesiculares normales"
            />
          </div>
        </div>
      </div>

      {/* Reflejos Fisiológicos */}
      <div className="card mb-4">
        <div className="card-header bg-danger text-white">
          <h5 className="mb-0">🔬 Reflejos Fisiológicos</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label"><strong>Reflejo Tusígeno</strong></label>
              <input
                type="text"
                className="form-control"
                value={consultaCompleta.reflejo_tusigeno || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, reflejo_tusigeno: e.target.value })}
                disabled={esFinalizada}
                placeholder="Ej: Positivo"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label"><strong>Reflejo Deglutorio</strong></label>
              <input
                type="text"
                className="form-control"
                value={consultaCompleta.reflejo_deglutorio || ''}
                onChange={(e) => setConsultaCompleta({ ...consultaCompleta, reflejo_deglutorio: e.target.value })}
                disabled={esFinalizada}
                placeholder="Ej: Presente"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Otros Hallazgos */}
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">🚶 Otros Hallazgos</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label"><strong>Postura y Marcha</strong></label>
            <textarea
              className="form-control"
              rows={3}
              value={consultaCompleta.postura_marcha || ''}
              onChange={(e) => setConsultaCompleta({ ...consultaCompleta, postura_marcha: e.target.value })}
              disabled={esFinalizada}
              placeholder="Ej: Normal, sin cojera"
            />
          </div>
        </div>
      </div>

      {/* Laboratorios */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">🧪 Laboratorios Realizados</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label"><strong>Laboratorios Realizados</strong></label>
            <textarea
              className="form-control"
              rows={4}
              value={consultaCompleta.laboratorios || ''}
              onChange={(e) => setConsultaCompleta({ ...consultaCompleta, laboratorios: e.target.value })}
              disabled={esFinalizada}
              placeholder="Nombre del laboratorio, resultados obtenidos, observaciones..."
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