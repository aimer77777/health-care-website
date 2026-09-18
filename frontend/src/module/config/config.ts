const configuredBackendHost = process.env.NEXT_PUBLIC_BACKEND_HOST?.trim();

export const BACKEND_HOST = configuredBackendHost
  ? configuredBackendHost
  : typeof window !== "undefined"
    ? window.location.origin
    : "https://health.ncu.edu.tw";
