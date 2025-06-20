import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './shared/styles/index.css'; // si deseas estilos propios
import {AuthProvider} from './features/auth/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './shared/styles/fullcalendar.css';





ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
