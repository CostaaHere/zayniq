const isDevelopment = import.meta.env.DEV;

export const logger = {
  error: (context: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(context, error);
    }
    // In production, only log safe information
    // Detailed errors are suppressed to prevent information leakage
  },
  warn: (context: string, details?: unknown) => {
    if (isDevelopment) {
      console.warn(context, details);
    }
  },
  info: (message: string, details?: unknown) => {
    if (isDevelopment) {
      console.log(message, details);
    }
  },
  debug: (message: string, details?: unknown) => {
    if (isDevelopment) {
      console.debug(message, details);
    }
  },
};
