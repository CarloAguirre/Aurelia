function readRequiredEnv(name: 'VITE_API_URL', value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`Missing required environment variable ${name}`);
  return normalized;
}

export const env = {
  apiUrl: readRequiredEnv('VITE_API_URL', import.meta.env.VITE_API_URL),
};