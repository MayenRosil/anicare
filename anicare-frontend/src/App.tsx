import 'react-big-calendar/lib/css/react-big-calendar.css';
import './shared/styles/calendar-fix.css'; // este archivo lo acabas de crear

import { Routes, Route } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import Dashboard from './features/dashboard/pages/Dashboard';
import PacientesPage from './features/pacientes/pages/PacientesPage';
import PropietariosPage from './features/propietarios/pages/PropietariosPage';
import CitasPage from './features/citas/pages/CitasPage';
import PrivateRoute from './shared/router/PrivateRoute';
import { useAuth } from './features/auth/context/AuthContext';
import ConsultaDetallePage from './features/consultas/pages/ConsultaDetallePage';
import HistorialClinicoPage from './features/pacientes/pages/HistorialClinicoPage';


export default function App() {
  const { cargando } = useAuth();

  if (cargando) return <p className="text-center mt-5">Verificando sesión...</p>;

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/propietarios" element={<PrivateRoute><PropietariosPage /></PrivateRoute>} />
      <Route path="/pacientes" element={<PrivateRoute><PacientesPage /></PrivateRoute>} />
      <Route path="/citas" element={<PrivateRoute><CitasPage /></PrivateRoute>} />
      <Route path="/consulta/:idConsulta" element={<ConsultaDetallePage />} />
      <Route path="/paciente/:idPaciente/historial" element={<HistorialClinicoPage />} />


    </Routes>
  );
}
