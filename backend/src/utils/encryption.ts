import crypto from 'crypto';
import env from '../config/env';

const ALGORITHM = env.ENCRYPTION_ALGORITHM;
const KEY = Buffer.from(env.ENCRYPTION_KEY, 'utf8').slice(0, 32); // Ensure 32 bytes for AES-256

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = (cipher as any).getAuthTag();

  // Return iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedData: string): string => {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  (decipher as any).setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcrypt');
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hashedPassword);
};

export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};
