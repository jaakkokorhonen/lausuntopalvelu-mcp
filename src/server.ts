import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { handleGetProposal, handleSearchProposals } from './tools/proposals.js';
import { logger } from './logger.js';

export const server = new Server(
  { name: 'lausuntopalvelu-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

// Rekisteröi työkalut
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_proposals',
      description: 'Hae lausuntopyyntöjä lausuntopalvelu.fi:stä otsikon, asiasanan tai valmistelijan perusteella',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Hakusana (otsikko, asiasana, valmistelija)' },
          status: { type: 'string', enum: ['open', 'closed', 'all'], default: 'all' },
          limit: { type: 'number', default: 20, maximum: 100 }
        }
      }
    },
    {
      name: 'get_proposal',
      description: 'Hae yksittäisen lausuntopyynnön tiedot ja kysymykset ID:n perusteella',
      inputSchema: {
        type: 'object',
        required: ['proposalId'],
        properties: {
          proposalId: { type: 'string', description: 'Lausuntopyynnön UUID' }
        }
      }
    }
  ]
}));

// Käsittele työkalukutsut
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  logger.info({ tool: request.params.name, arguments: request.params.arguments }, 'Tool called');
  try {
    switch (request.params.name) {
      case 'search_proposals':
        return await handleSearchProposals(request.params.arguments);
      case 'get_proposal':
        return await handleGetProposal(request.params.arguments);
      default:
        throw new Error(`Tuntematon työkalu: ${request.params.name}`);
    }
  } catch (err: any) {
    logger.error({ err, tool: request.params.name }, 'Tool execution failed');
    return {
      isError: true,
      content: [{ type: 'text', text: `Virhe: ${err.message || String(err)}` }]
    };
  }
});
