export class TestWebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private requestId = 0;

  async connect(url: string = 'ws://localhost:3000/ws'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        resolve();
      };

      this.ws.onerror = (error) => {
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const handler = this.messageHandlers.get(message.requestId);
          if (handler) {
            handler(message);
            this.messageHandlers.delete(message.requestId);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    });
  }

  async send<T = any>(category: string, action: string, payload: any = {}): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const requestId = `test-${++this.requestId}-${Date.now()}`;
      const timeout = setTimeout(() => {
        this.messageHandlers.delete(requestId);
        reject(new Error('WebSocket request timeout'));
      }, 5000);

      this.messageHandlers.set(requestId, (message) => {
        clearTimeout(timeout);
        if (message.success) {
          resolve(message.data);
        } else {
          reject(new Error(message.error?.message || 'WebSocket request failed'));
        }
      });

      this.ws!.send(JSON.stringify({
        id: requestId,
        type: 'request',
        category,
        action,
        payload,
        timestamp: new Date().toISOString(),
      }));
    });
  }

  async authenticate(sessionId: string): Promise<void> {
    await this.send('auth', 'authenticate', { sessionToken: sessionId });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}
