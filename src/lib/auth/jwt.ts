import jwt from 'jsonwebtoken';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está configurado en las variables de entorno.');
  return secret;
}

export const signToken = (payload: Record<string, unknown>) => {
  return jwt.sign(payload, getSecret(), { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
};
