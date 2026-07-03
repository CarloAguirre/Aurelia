import { httpPost } from './http-client';

export interface MobileBridgeLaunchResponse {
  ticket: string;
  expiresAt: string;
}

export function createMobileBridgeLaunch(): Promise<MobileBridgeLaunchResponse> {
  return httpPost<Record<string, never>, MobileBridgeLaunchResponse>('/auth/iframe-ticket', {});
}
