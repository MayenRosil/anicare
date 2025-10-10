// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './shared/config/db';
import authRoutes from './application/routes/auth.routes';
import usuarioRoutes from './application/routes/usuario.routes';
import propietarioRoutes from './application/routes/propietario.routes';
import pacienteRoutes from './application/routes/paciente.routes';
import citaRoutes from './application/routes/cita.routes';
import razaRoutes from './application/routes/raza.routes';
import doctorRoutes from './application/routes/doctor.route';
import consultaRoutes from './application/routes/consulta.routes';
import diagnosticoRoutes from './application/routes/diagnostico.routes';
import tratamientoRoutes from './application/routes/tratamiento.routes';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Implementacion de rutas
app.use('/api/auth', authRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', propietarioRoutes);
app.use('/api', pacienteRoutes);
app.use('/api', citaRoutes);
app.use('/api', razaRoutes);
app.use('/api', doctorRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/diagnosticos', diagnosticoRoutes);
app.use('/api/tratamientos', tratamientoRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
