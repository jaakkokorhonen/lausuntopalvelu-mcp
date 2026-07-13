import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { server } from './server.js';
import { logger } from './logger.js';

const transport = new StdioServerTransport();
await server.connect(transport);
logger.info('lausuntopalvelu-mcp stdio server connected');
