import { wsClient } from '../websocket/client';

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string }> {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await wsClient.request<{ url: string }>(
      'dish',
      'uploadImage',
      {
        image: base64,
        fileName: file.name,
        contentType: file.type,
      }
    );

    return response;
  },
};
