// src/features/citas/components/ModalPacienteNuevo.tsx
import { useState, useEffect } from 'react';
import { obtenerPropietarios, crearPropietario } from '../../propietarios/services/propietarioService';
import { crearPaciente } from '../../pacientes/services/pacienteService';
import { obtenerEspecies } from '../../pacientes/services/especieService';
import { obtenerRazasPorEspecie, buscarOCrearRazaPersonalizada } from '../../pacientes/services/razaService';

interface Props {
  onClose: () => void;
  onPacienteCreado: (idPaciente: number) => void;
}

export default function ModalPacienteNuevo({ onClose, onPacienteCreado }: Props) {
  const [paso, setPaso] = useState(1); // 1 = Propietario, 2 = Paciente

  // Propietarios
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [creandoPropietario, setCreandoPropietario] = useState(false);
  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState<number | null>(null);
  const [formPropietario, setFormPropietario] = useState({
    nombre: '',
    apellido: '',
    dpi: '',
    nit: '',
    direccion: '',
    telefono: '',
    correo: ''
  });

  // Paciente
  const [especies, setEspecies] = useState<any[]>([]);
  const [razas, setRazas] = useState<any[]>([]);
  const [especieSeleccionada, setEspecieSeleccionada] = useState(1);
  const [mostrarInputEspecieOtra, setMostrarInputEspecieOtra] = useState(false);
  const [especiePersonalizada, setEspeciePersonalizada] = useState('');
  const [razaPersonalizada, setRazaPersonalizada] = useState('');

  const [formPaciente, setFormPaciente] = useState({
    nombre: '',
    sexo: 'M' as 'M' | 'F',
    fecha_nacimiento: '',
    edad_aproximada: false,
    color: '',
    id_raza: 0,
    castrado: false,
    adoptado: false,
    fecha_adopcion: null as string | null
  });

  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarPropietarios();
    cargarEspecies();
  }, []);

  useEffect(() => {
    if (especieSeleccionada) {
      cargarRazas(especieSeleccionada);
      setMostrarInputEspecieOtra(especieSeleccionada === 3);
    }
  }, [especieSeleccionada]);

  const cargarPropietarios = async () => {
    const data = await obtenerPropietarios();
    setPropietarios(data);
  };

  const cargarEspecies = async () => {
    const data = await obtenerEspecies();
    setEspecies(data);
  };

  const cargarRazas = async (idEspecie: number) => {
    const data = await obtenerRazasPorEspecie(idEspecie);
    setRazas(data);
    if (data.length > 0) {
      setFormPaciente({ ...formPaciente, id_raza: data[0].id });
    }
  };

  const handlePropietarioChange = (field: string, value: string) => {
    setFormPropietario({ ...formPropietario, [field]: value });
  };

  const handlePacienteChange = (field: string, value: any) => {
    setFormPaciente({ ...formPaciente, [field]: value });
  };

  const handleSubmitPropietario = async () => {
    if (creandoPropietario) {
      // Validar campos
      if (!formPropietario.nombre || !formPropietario.apellido) {
        alert('Complete los campos obligatorios del propietario');
        return;
      }

      setCargando(true);
      try {
        const resultado = await crearPropietario(formPropietario);
        setPropietarioSeleccionado(resultado.id);
        setPaso(2);
      } catch (error) {
        alert('Error al crear el propietario');
      } finally {
        setCargando(false);
      }
    } else {
      // Seleccionar propietario existente
      if (!propietarioSeleccionado) {
        alert('Seleccione un propietario');
        return;
      }
      setPaso(2);
    }
  };

  const handleSubmitPaciente = async () => {
    if (!formPaciente.nombre || !formPaciente.fecha_nacimiento) {
      alert('Complete los campos obligatorios del paciente');
      return;
    }

    setCargando(true);
    try {
      let idRazaFinal = formPaciente.id_raza;

      // Si es especie "Otro" y hay datos personalizados
      if (especieSeleccionada === 3 && especiePersonalizada && razaPersonalizada) {
        const resultado = await buscarOCrearRazaPersonalizada(razaPersonalizada, especiePersonalizada);
        idRazaFinal = resultado.id;
      }

      const pacienteData = {
        ...formPaciente,
        id_propietario: propietarioSeleccionado!,
        id_raza: idRazaFinal,
        fecha_adopcion: formPaciente.adoptado ? formPaciente.fecha_adopcion : null
      };

      const resultado = await crearPaciente(pacienteData);
      onPacienteCreado(resultado.id);
    } catch (error) {
      alert('Error al crear el paciente');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: '#00000099' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-plus-fill me-2"></i>
              Registrar Paciente Nuevo
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Indicador de pasos */}
            <div className="d-flex justify-content-between mb-4">
              <div className={`flex-fill text-center ${paso >= 1 ? 'text-primary fw-bold' : 'text-muted'}`}>
                <i className={`bi ${paso === 1 ? 'bi-1-circle-fill' : 'bi-1-circle'} fs-3`}></i>
                <div>Propietario</div>
              </div>
              <div className="flex-fill d-flex align-items-center">
                <hr className="w-100" />
              </div>
              <div className={`flex-fill text-center ${paso >= 2 ? 'text-primary fw-bold' : 'text-muted'}`}>
                <i className={`bi ${paso === 2 ? 'bi-2-circle-fill' : 'bi-2-circle'} fs-3`}></i>
                <div>Paciente</div>
              </div>
            </div>

            {/* PASO 1: PROPIETARIO */}
            {paso === 1 && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-bold">¿El propietario ya existe?</label>
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="tipoPropietario"
                      id="propExistente"
                      checked={!creandoPropietario}
                      onChange={() => setCreandoPropietario(false)}
                    />
                    <label className="btn btn-outline-primary" htmlFor="propExistente">
                      <i className="bi bi-search me-2"></i>
                      Seleccionar Existente
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="tipoPropietario"
                      id="propNuevo"
                      checked={creandoPropietario}
                      onChange={() => setCreandoPropietario(true)}
                    />
                    <label className="btn btn-outline-primary" htmlFor="propNuevo">
                      <i className="bi bi-plus-circle me-2"></i>
                      Crear Nuevo
                    </label>
                  </div>
                </div>

                {!creandoPropietario ? (
                  <div className="mb-3">
                    <label className="form-label">Propietario *</label>
                    <select
                      className="form-select"
                      value={propietarioSeleccionado || ''}
                      onChange={(e) => setPropietarioSeleccionado(Number(e.target.value))}
                    >
                      <option value="">Seleccione un propietario</option>
                      {propietarios.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} {p.apellido} - {p.telefono}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formPropietario.nombre}
                        onChange={(e) => handlePropietarioChange('nombre', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellido *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formPropietario.apellido}
                        onChange={(e) => handlePropietarioChange('apellido', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">DPI</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formPropietario.dpi}
                        onChange={(e) => handlePropietarioChange('dpi', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">NIT</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formPropietario.nit}
                        onChange={(e) => handlePropietarioChange('nit', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Teléfono *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formPropietario.telefono}
                        onChange={(e) => handlePropietarioChange('telefono', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Correo</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formPropietario.correo}
                        onChange={(e) => handlePropietarioChange('correo', e.target.value)}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Dirección</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formPropietario.direccion}
                        onChange={(e) => handlePropietarioChange('direccion', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PASO 2: PACIENTE */}
            {paso === 2 && (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre del Paciente *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formPaciente.nombre}
                    onChange={(e) => handlePacienteChange('nombre', e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Sexo *</label>
                  <select
                    className="form-select"
                    value={formPaciente.sexo}
                    onChange={(e) => handlePacienteChange('sexo', e.target.value)}
                  >
                    <option value="M">Macho</option>
                    <option value="F">Hembra</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Especie *</label>
                  <select
                    className="form-select"
                    value={especieSeleccionada}
                    onChange={(e) => setEspecieSeleccionada(Number(e.target.value))}
                  >
                    {especies.map(esp => (
                      <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                    ))}
                  </select>
                </div>

                {mostrarInputEspecieOtra && (
                  <>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tipo de Animal *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Ave, Reptil, Roedor"
                        value={especiePersonalizada}
                        onChange={(e) => setEspeciePersonalizada(e.target.value)}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Raza/Tipo Específico *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Loro Amazónico, Iguana Verde"
                        value={razaPersonalizada}
                        onChange={(e) => setRazaPersonalizada(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {!mostrarInputEspecieOtra && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Raza *</label>
                    <select
                      className="form-select"
                      value={formPaciente.id_raza}
                      onChange={(e) => handlePacienteChange('id_raza', Number(e.target.value))}
                    >
                      {razas.map(r => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="col-md-6 mb-3">
                  <label className="form-label">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formPaciente.fecha_nacimiento}
                    onChange={(e) => handlePacienteChange('fecha_nacimiento', e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formPaciente.color}
                    onChange={(e) => handlePacienteChange('color', e.target.value)}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="castrado"
                      checked={formPaciente.castrado}
                      onChange={(e) => handlePacienteChange('castrado', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="castrado">
                      Castrado/Esterilizado
                    </label>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="adoptado"
                      checked={formPaciente.adoptado}
                      onChange={(e) => handlePacienteChange('adoptado', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="adoptado">
                      Adoptado
                    </label>
                  </div>
                </div>

                {formPaciente.adoptado && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Adopción</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formPaciente.fecha_adopcion || ''}
                      onChange={(e) => handlePacienteChange('fecha_adopcion', e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            {paso === 2 && (
              <button
                type="button"
                className="btn btn-secondary me-auto"
                onClick={() => setPaso(1)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Atrás
              </button>
            )}
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancelar
            </button>
            {paso === 1 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitPropietario}
                disabled={cargando}
              >
                {cargando ? 'Procesando...' : 'Siguiente'}
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            )}
            {paso === 2 && (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmitPaciente}
                disabled={cargando}
              >
                {cargando ? 'Guardando...' : 'Guardar y Atender Cita'}
                <i className="bi bi-check-lg ms-2"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}