// src/scripts/hashPassword.ts
import bcrypt from 'bcryptjs';

const generarHash = async () => {
  const hash = await bcrypt.hash('ana123', 10);
  console.log('Contraseña encriptada:', hash);
};

generarHash();
