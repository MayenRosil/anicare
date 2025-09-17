// src/shared/utils/generateToken.ts
import jwt from 'jsonwebtoken';

const generateToken = (id: number, id_rol: number): string => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  return jwt.sign({ id, id_rol }, secret, { expiresIn: '12h' });
};

export default generateToken;
