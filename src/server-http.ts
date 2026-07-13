import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { server } from './server.js';
import { logger } from './logger.js';

const app = express();
const port = process.env.PORT || 3000;

let transport: SSEServerTransport | null = null;

app.get('/sse', async (req, res) => {
  logger.info('SSE connection request received');
  transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);
});

app.post('/messages', express.json(), async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req as any, res as any, req.body);
  } else {
    res.status(500).send('No active SSE connection');
  }
});

app.listen(port, () => {
  logger.info(`lausuntopalvelu-mcp HTTP/SSE server listening on port ${port}`);
});
