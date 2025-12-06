// Utilitaires pour nettoyer et transformer les données

/**
 * Nettoie une chaîne de caractères : trim + null si vide
 */
export const cleanStringField = (value: any): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  
  if (typeof value !== 'string') {
    return null;
  }
  
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

/**
 * Nettoie et parse un nombre
 */
export const cleanNumberField = (value: any): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }
  
  return parsed;
};

/**
 * Nettoie et parse une date
 */
export const cleanDateField = (value: any): Date | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
};

/**
 * Valide et nettoie un UUID
 */
export const cleanUUIDField = (value: any): string | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  if (typeof value !== 'string') {
    return null;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(value)) {
    return null;
  }
  
  return value.toLowerCase();
};

/**
 * Nettoie un tableau
 */
export const cleanArrayField = (value: any): any[] | null => {
  if (value === undefined || value === null) {
    return null;
  }
  
  if (!Array.isArray(value)) {
    return null;
  }
  
  return value.length === 0 ? null : value;
};

/**
 * Nettoie les champs optionnels d'un objet
 * @param obj L'objet à nettoyer
 * @param stringFields Liste des champs string à nettoyer
 * @param numberFields Liste des champs number à nettoyer
 * @param dateFields Liste des champs date à nettoyer
 * @param uuidFields Liste des champs UUID à nettoyer
 */
export const cleanOptionalFields = (
  obj: Record<string, any>,
  options: {
    stringFields?: string[];
    numberFields?: string[];
    dateFields?: string[];
    uuidFields?: string[];
    arrayFields?: string[];
  } = {}
): Record<string, any> => {
  const cleaned: Record<string, any> = { ...obj };
  
  // Nettoyer les champs string
  if (options.stringFields) {
    options.stringFields.forEach(field => {
      if (field in cleaned) {
        cleaned[field] = cleanStringField(cleaned[field]);
      }
    });
  }
  
  // Nettoyer les champs number
  if (options.numberFields) {
    options.numberFields.forEach(field => {
      if (field in cleaned) {
        cleaned[field] = cleanNumberField(cleaned[field]);
      }
    });
  }
  
  // Nettoyer les champs date
  if (options.dateFields) {
    options.dateFields.forEach(field => {
      if (field in cleaned) {
        cleaned[field] = cleanDateField(cleaned[field]);
      }
    });
  }
  
  // Nettoyer les champs UUID
  if (options.uuidFields) {
    options.uuidFields.forEach(field => {
      if (field in cleaned) {
        cleaned[field] = cleanUUIDField(cleaned[field]);
      }
    });
  }
  
  // Nettoyer les champs array
  if (options.arrayFields) {
    options.arrayFields.forEach(field => {
      if (field in cleaned) {
        cleaned[field] = cleanArrayField(cleaned[field]);
      }
    });
  }
  
  return cleaned;
};

/**
 * Nettoie tous les champs string d'un objet (trim)
 */
export const trimAllStrings = (obj: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      cleaned[key] = value.trim();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Récursif pour les objets imbriqués
      cleaned[key] = trimAllStrings(value);
    } else if (Array.isArray(value)) {
      // Traiter les tableaux
      cleaned[key] = value.map(item =>
        typeof item === 'string' ? item.trim() :
        item && typeof item === 'object' ? trimAllStrings(item) :
        item
      );
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

/**
 * Convertit les chaînes vides en null pour tout un objet
 */
export const emptyStringsToNull = (obj: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === '') {
      cleaned[key] = null;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = emptyStringsToNull(value);
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(item =>
        item && typeof item === 'object' ? emptyStringsToNull(item) : item
      );
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

