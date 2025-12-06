import crypto from 'crypto';
import CryptoJS from 'crypto-js';

// Configuration de chiffrement
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

// Chiffrement AES-256-GCM
export const encrypt = (text: string): { encrypted: string; iv: string; tag: string } => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = (cipher as any).getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
};

// Déchiffrement AES-256-GCM
export const decrypt = (encryptedData: { encrypted: string; iv: string; tag: string }): string => {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  (decipher as any).setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Chiffrement simple pour les données non critiques
export const simpleEncrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

// Déchiffrement simple
export const simpleDecrypt = (encryptedText: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Hachage sécurisé avec salt
export const hashWithSalt = (text: string, salt?: string): { hash: string; salt: string } => {
  const actualSalt = salt || crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(text, actualSalt, 100000, 64, 'sha512').toString('hex');
  
  return { hash, salt: actualSalt };
};

// Vérification de hachage
export const verifyHash = (text: string, hash: string, salt: string): boolean => {
  const testHash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha512').toString('hex');
  return testHash === hash;
};

// Génération de token sécurisé
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Génération de mot de passe sécurisé
export const generateSecurePassword = (length: number = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

// Validation de force du mot de passe
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  // Longueur minimale
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  // Présence de minuscules
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }
  
  // Présence de majuscules
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }
  
  // Présence de chiffres
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  // Présence de caractères spéciaux
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  // Longueur recommandée
  if (password.length >= 12) {
    score += 1;
  }
  
  return {
    isValid: score >= 4,
    score,
    feedback
  };
};
