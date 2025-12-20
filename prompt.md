debug and solve this: [WS DEBUG] handleMessage: {id: 'd64b833f-c674-472d-a270-171736367b43', type: 'response', requestId: '1766242170687-gqwc4jvyp', success: true, data: {…}, …}
client.ts:333 [WS DEBUG] handleMessage: {id: '7bf592c2-3051-491b-b081-10a0ab09acb6', type: 'error', requestId: '1766242177241-jlokg947t', success: false, error: {…}, …}
MenuOnboarding.tsx:106 Failed to create menu: Error: Invalid message format
    at WebSocketClient.handleMessage (client.ts:349:25)
    at ws.onmessage (client.ts:178:14)