import { API_URL } from '../http-client';

export interface FileResponse {
  id: string;
  originalFilename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedAt: string;
}

export async function uploadFile(uri: string, filename: string): Promise<FileResponse> {
  const formData = new FormData();
  formData.append('file', { uri, type: 'image/jpeg', name: filename } as unknown as Blob);

  const response = await fetch(`${API_URL}/files/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
  return (await response.json()) as FileResponse;
}
