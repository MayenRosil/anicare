import { useEffect, useState } from 'react';
import { obtenerPacientes, crearPaciente } from '../services/pacienteService';
import { obtenerRazas } from '../services/razaService';
import { obtenerPropietarios } from '../services/propietarioService';

interface Paciente {
  id: number;
  id_propietario: number;
  id_raza: number;
  nombre: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  color: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [razas, setRazas] = useState<any[]>([]);
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevo, setNuevo] = useState<Omit<Paciente, 'id'>>({
    id_propietario: 0,
    id_raza: 0,
    nombre: '',
    sexo: 'M',
    fecha_nacimiento: '',
    color: ''
  });

  const cargarDatos = async () => {
    const [pac, propietarios, razas] = await Promise.all([
      obtenerPacientes(),
      obtenerPropietarios(),
      obtenerRazas()
    ]);
    setPacientes(pac);
    setPropietarios(propietarios);
    console.log(typeof razas)
    setRazas(razas);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevo({ ...nuevo, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearPaciente(nuevo);
      setMostrarModal(false);
      setNuevo({
        id_propietario: 0,
        id_raza: 0,
        nombre: '',
        sexo: 'M',
        fecha_nacimiento: '',
        color: ''
      });
      cargarDatos();
    } catch {
      alert('Error al guardar el paciente');
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Pacientes Registrados</h2>
        <button className="btn btn-success" onClick={() => setMostrarModal(true)}>
          + Agregar Paciente
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Sexo</th>
              <th>Color</th>
              <th>Fecha de nacimiento</th>
              <th>Raza</th>
              <th>Propietario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.nombre}</td>
                <td>{p.sexo === 'M' ? 'Macho' : 'Hembra'}</td>
                <td>{p.color}</td>
                <td>{p.fecha_nacimiento}</td>
                <td>{p.id_raza}</td>
                <td>{p.id_propietario}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2">Editar</button>
                  <button className="btn btn-sm btn-outline-danger">Eliminar</button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal d-block" tabIndex={-1} style={{ background: '#00000066' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Nuevo Paciente</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" name="nombre" className="form-control" required value={nuevo.nombre} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sexo</label>
                    <select name="sexo" className="form-select" required value={nuevo.sexo} onChange={handleChange}>
                      <option value="M">Macho</option>
                      <option value="F">Hembra</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Color</label>
                    <input type="text" name="color" className="form-control" required value={nuevo.color} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha de nacimiento</label>
                    <input type="date" name="fecha_nacimiento" className="form-control" required value={nuevo.fecha_nacimiento} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Raza</label>
                    <select name="id_raza" className="form-select" required value={nuevo.id_raza} onChange={handleChange}>
                      <option value="">Seleccione una raza</option>
                      {razas.map(raza => (
                        <option key={raza.id} value={raza.id}>{raza.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Propietario</label>
                    <select name="id_propietario" className="form-select" required value={nuevo.id_propietario} onChange={handleChange}>
                      <option value="">Seleccione un propietario</option>
                      {propietarios.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
