// src/features/consultas/pages/FichaClinicaPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../shared/config/axiosConfig';

interface Diagnostico {
  id?: number;
  id_consulta: number;
  id_diagnostico: number;
  tipo: string;
  estado: string;
  comentarios: string;
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

      // 1. Actualizar consulta
      await axiosInstance.put(`/consultas/${consulta.id}`, consulta);

      // 2. Para cada diagnóstico
      for (const diag of diagnosticos) {
        if (diag.id) {
          // Actualizar diagnóstico existente
          await axiosInstance.put(`/diagnosticos/${diag.id}`, {
            id_diagnostico: diag.id_diagnostico,
            tipo: diag.tipo,
            estado: diag.estado,
            comentarios: diag.comentarios
          });
        } else {
          // Crear nuevo diagnóstico
          const diagRes = await axiosInstance.post('/diagnosticos', {
            id_consulta: Number(idConsulta),
            id_diagnostico: diag.id_diagnostico,
            tipo: diag.tipo,
            estado: diag.estado,
            comentarios: diag.comentarios
          });
          diag.id = diagRes.data.id; // Asignar el nuevo ID
        }

        // 3. Para cada tratamiento del diagnóstico
        for (const trat of diag.tratamientos) {
          // Asegurarse de que el tratamiento esté vinculado al diagnóstico
          trat.id_diagnostico_consulta = diag.id!;

          if (trat.id) {
            // Actualizar tratamiento existente
            await axiosInstance.put(`/tratamientos/${trat.id}`, trat);
          } else {
            // Crear nuevo tratamiento
            await axiosInstance.post('/tratamientos', trat);
          }
        }
      }

      alert('Datos guardados exitosamente');
      await cargarDatos(); // Recargar para sincronizar IDs
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
        id_diagnostico: 1, // ID por defecto
        tipo: 'Principal',
        estado: 'Activo',
        comentarios: '',
        tratamientos: [
          {
            id_diagnostico_consulta: null,
            id_medicamento: 1, // ID por defecto
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

  // Eliminar diagnóstico
  const eliminarDiagnostico = (diagIndex: number) => {
    setDiagnosticos(diagnosticos.filter((_, i) => i !== diagIndex));
  };

  // Eliminar tratamiento
  const eliminarTratamiento = (diagIndex: number, tratIndex: number) => {
    const nuevosDiagnosticos = [...diagnosticos];
    nuevosDiagnosticos[diagIndex].tratamientos = nuevosDiagnosticos[diagIndex].tratamientos.filter(
      (_, i) => i !== tratIndex
    );
    setDiagnosticos(nuevosDiagnosticos);
  };

  if (loading) return <p className="p-4">Cargando ficha clínica...</p>;
  if (!consulta) return <p className="p-4">No se encontró la consulta.</p>;

  return (
    <div className="container mt-4">
      <h3 className="text-primary mb-4">Ficha Clínica - Consulta #{idConsulta}</h3>

      {/* Datos de la consulta */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">Datos de la Consulta</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={consulta.estado || ''}
                onChange={(e) => setConsulta({ ...consulta, estado: e.target.value })}
              >
                <option value="Abierta">Abierta</option>
                <option value="Atendida">Atendida</option>
                <option value="Cerrada">Cerrada</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Fecha</label>
              <input
                type="text"
                className="form-control"
                value={new Date(consulta.fecha_hora).toLocaleString()}
                disabled
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Notas adicionales</label>
            <textarea
              className="form-control"
              rows={3}
              value={consulta.notas_adicionales || ''}
              onChange={(e) => setConsulta({ ...consulta, notas_adicionales: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Diagnósticos y Tratamientos */}
      {diagnosticos.map((diag, diagIndex) => (
        <div key={diagIndex} className="card mb-4">
          <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <span>Diagnóstico #{diagIndex + 1}</span>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => eliminarDiagnostico(diagIndex)}
            >
              Eliminar Diagnóstico
            </button>
          </div>
          <div className="card-body">
            {/* Datos del diagnóstico */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">ID Diagnóstico</label>
                <input
                  type="number"
                  className="form-control"
                  value={diag.id_diagnostico}
                  onChange={(e) =>
                    actualizarDiagnostico(diagIndex, 'id_diagnostico', Number(e.target.value))
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Tipo</label>
                <select
                  className="form-select"
                  value={diag.tipo}
                  onChange={(e) => actualizarDiagnostico(diagIndex, 'tipo', e.target.value)}
                >
                  <option value="Principal">Principal</option>
                  <option value="Secundario">Secundario</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={diag.estado}
                  onChange={(e) => actualizarDiagnostico(diagIndex, 'estado', e.target.value)}
                >
                  <option value="Activo">Activo</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Presuntivo">Presuntivo</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Comentarios</label>
              <textarea
                className="form-control"
                rows={2}
                value={diag.comentarios}
                onChange={(e) => actualizarDiagnostico(diagIndex, 'comentarios', e.target.value)}
              />
            </div>

            {/* Tratamientos */}
            <h6 className="text-success mt-4">Tratamientos</h6>
            {diag.tratamientos.map((trat, tratIndex) => (
              <div key={tratIndex} className="border p-3 mb-3 bg-light">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">Tratamiento #{tratIndex + 1}</span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminarTratamiento(diagIndex, tratIndex)}
                  >
                    Eliminar
                  </button>
                </div>
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <label className="form-label">ID Medicamento</label>
                    <input
                      type="number"
                      className="form-control"
                      value={trat.id_medicamento}
                      onChange={(e) =>
                        actualizarTratamiento(
                          diagIndex,
                          tratIndex,
                          'id_medicamento',
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Dosis</label>
                    <input
                      type="text"
                      className="form-control"
                      value={trat.dosis}
                      onChange={(e) =>
                        actualizarTratamiento(diagIndex, tratIndex, 'dosis', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Frecuencia</label>
                    <input
                      type="text"
                      className="form-control"
                      value={trat.frecuencia}
                      onChange={(e) =>
                        actualizarTratamiento(diagIndex, tratIndex, 'frecuencia', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Duración</label>
                    <input
                      type="text"
                      className="form-control"
                      value={trat.duracion}
                      onChange={(e) =>
                        actualizarTratamiento(diagIndex, tratIndex, 'duracion', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="form-label">Instrucciones</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={trat.instrucciones}
                    onChange={(e) =>
                      actualizarTratamiento(diagIndex, tratIndex, 'instrucciones', e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => agregarTratamiento(diagIndex)}
            >
              + Agregar Tratamiento
            </button>
          </div>
        </div>
      ))}

      {/* Botones de acción */}
      <div className="d-flex gap-2 mb-4">
        <button className="btn btn-primary" onClick={agregarDiagnostico}>
          + Agregar Diagnóstico
        </button>
        <button className="btn btn-success" onClick={guardarTodo} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Datos'}
        </button>
        <button className="btn btn-secondary" onClick={cargarDatos}>
          Recargar
        </button>
      </div>
    </div>
  );
}