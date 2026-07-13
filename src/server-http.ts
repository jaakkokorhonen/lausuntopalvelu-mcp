import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { server } from './server.js';
import { logger } from './logger.js';

const app = express();
const port = process.env.PORT || 3000;

const transports = new Map<string, SSEServerTransport>();

app.get('/sse', async (req, res) => {
  logger.info('SSE connection request received');
  const transport = new SSEServerTransport('/messages', res);
  const sessionId = transport.sessionId;
  transports.set(sessionId, transport);

  transport.onclose = () => {
    transports.delete(sessionId);
    logger.info({ sessionId }, 'SSE connection closed');
  };

  await server.connect(transport);
});

app.post('/messages', express.json(), async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);
  if (transport) {
    await transport.handlePostMessage(req as any, res as any, req.body);
  } else {
    res.status(404).send('Session not found');
  }
});

app.listen(port, () => {
  logger.info(`lausuntopalvelu-mcp HTTP/SSE server listening on port ${port}`);
});
