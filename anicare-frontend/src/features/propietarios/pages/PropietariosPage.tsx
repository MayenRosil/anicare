import { useEffect, useState } from 'react';
import { obtenerPropietarios } from '../services/propietarioService';
import axiosInstance from '../../../shared/config/axiosConfig';

interface Propietario {
  id: number;
  nombre: string;
  apellido: string;
  dpi: string;
  nit: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export default function PropietariosPage() {
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevo, setNuevo] = useState<Omit<Propietario, 'id'>>({
    nombre: '',
    apellido: '',
    dpi: '',
    nit: '',
    direccion: '',
    telefono: '',
    correo: ''
  });

  const cargarPropietarios = async () => {
    try {
      const data = await obtenerPropietarios();
      setPropietarios(data);
    } catch {
      setError('No se pudieron cargar los propietarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPropietarios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevo({ ...nuevo, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/propietarios', nuevo);
      setMostrarModal(false);
      setNuevo({ nombre: '', apellido: '', dpi: '', nit: '', direccion: '', telefono: '', correo: '' });
      cargarPropietarios();
    } catch {
      alert('Error al guardar el propietario');
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Propietarios Registrados</h2>
        <button className="btn btn-success" onClick={() => setMostrarModal(true)}>
          + Agregar Propietario
        </button>
      </div>

      {cargando ? (
        <p>Cargando propietarios...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>DPI</th>
                <th>NIT</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {propietarios.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td>{p.nombre} {p.apellido}</td>
                  <td>{p.dpi}</td>
                  <td>{p.nit}</td>
                  <td>{p.telefono}</td>
                  <td>{p.correo}</td>
                  <td>{p.direccion}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">Editar</button>
                    <button className="btn btn-sm btn-outline-danger">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="modal d-block" tabIndex={-1} style={{ background: '#00000066' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Nuevo Propietario</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                </div>
                <div className="modal-body">
                  {[
                    { label: 'Nombre', name: 'nombre' },
                    { label: 'Apellido', name: 'apellido' },
                    { label: 'DPI', name: 'dpi' },
                    { label: 'NIT', name: 'nit' },
                    { label: 'Dirección', name: 'direccion' },
                    { label: 'Teléfono', name: 'telefono' },
                    { label: 'Correo', name: 'correo', type: 'email' }
                  ].map(({ label, name, type = 'text' }) => (
                    <div className="mb-3" key={name}>
                      <label className="form-label">{label}</label>
                      <input
                        type={type}
                        name={name}
                        value={nuevo[name as keyof typeof nuevo]}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>
                    Cancelar
                  </button>
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
