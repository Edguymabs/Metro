/**
 * Extrait les détails d'erreur d'une réponse API pour affichage dans les toasts
 */
export const extractErrorDetails = (error: any): { message: string; details?: string | string[] } => {
  // Si c'est une erreur réseau
  if (!error.response) {
    return {
      message: error.message || 'Erreur de connexion',
      details: error.stack || undefined,
    };
  }

  const response = error.response;
  const data = response.data;

  // Message principal
  let message = data?.message || data?.error || `Erreur ${response.status}: ${response.statusText}`;

  // Détails de l'erreur
  let details: string | string[] | undefined;

  // Si c'est une erreur de validation avec un tableau d'erreurs
  if (data?.errors && Array.isArray(data.errors)) {
    details = data.errors;
    if (!message.includes('validation') && !message.includes('invalide')) {
      message = 'Données invalides';
    }
  }
  // Si c'est une erreur de validation avec un objet d'erreurs
  else if (data?.errors && typeof data.errors === 'object') {
    const errorMessages: string[] = [];
    Object.keys(data.errors).forEach((key) => {
      const fieldErrors = Array.isArray(data.errors[key])
        ? data.errors[key]
        : [data.errors[key]];
      fieldErrors.forEach((err: string) => {
        errorMessages.push(`${key}: ${err}`);
      });
    });
    if (errorMessages.length > 0) {
      details = errorMessages;
      if (!message.includes('validation') && !message.includes('invalide')) {
        message = 'Données invalides';
      }
    }
  }
  // Si il y a des détails dans la réponse
  else if (data?.details) {
    details = typeof data.details === 'string' ? data.details : JSON.stringify(data.details, null, 2);
  }
  // Si il y a un message détaillé différent du message principal
  else if (data?.message && data.message.length > 100) {
    details = data.message;
    message = 'Erreur lors de la requête';
  }
  // Logs de débogage si disponibles
  else if (data?.debug || data?.stack) {
    details = data.debug || data.stack;
  }
  // Informations de la réponse complète en dernier recours
  else if (response.status >= 400) {
    details = JSON.stringify(
      {
        status: response.status,
        statusText: response.statusText,
        url: response.config?.url,
        method: response.config?.method,
        data: data,
      },
      null,
      2
    );
  }

  return { message, details };
};

