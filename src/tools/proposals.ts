import { z } from 'zod';
import { apiClient, parseMsDate } from '../client.js';
import { ODataList, ODataItem, Proposal, Question } from '../types.js';

export const SearchProposalsSchema = z.object({
  query: z.string().max(200).optional(),
  status: z.enum(['open', 'closed', 'all']).default('all'),
  limit: z.number().int().min(1).max(100).default(20),
});

export const GetProposalSchema = z.object({
  proposalId: z.string().uuid('proposalId must be a valid UUID'),
});

export async function handleSearchProposals(args: unknown) {
  const parsed = SearchProposalsSchema.parse(args);
  const nowStr = new Date().toISOString().split('.')[0]; // YYYY-MM-DDTHH:MM:SS

  const filters: string[] = [];
  if (parsed.query) {
    // Escape single quotes in query to prevent syntax errors
    const escapedQuery = parsed.query.replace(/'/g, "''");
    filters.push(`substringof('${escapedQuery}', Name)`);
  }
  if (parsed.status === 'open') {
    filters.push(`ClosingDate gt datetime'${nowStr}'`);
  } else if (parsed.status === 'closed') {
    filters.push(`ClosingDate lt datetime'${nowStr}'`);
  }

  const searchParams: Record<string, string> = {
    '$top': String(parsed.limit),
  };
  if (filters.length > 0) {
    searchParams['$filter'] = filters.join(' and ');
  }

  const response = await apiClient.get('Proposals', { searchParams }).json<ODataList<Proposal>>();
  const proposals = response.d;

  if (proposals.length === 0) {
    return {
      content: [{ type: 'text', text: 'Ei löytynyt lausuntopyyntöjä.' }],
    };
  }

  let text = `Löytyi ${proposals.length} lausuntopyyntöä:\n\n`;
  proposals.forEach((p, idx) => {
    const deadline = parseMsDate(p.Deadline) ?? 'Ei tiedossa';
    const closing = parseMsDate(p.ClosingDate);
    const isClosed = closing ? new Date(closing) < new Date() : false;
    const statusText = isClosed ? 'päättynyt' : 'avoin';
    
    text += `${idx + 1}. **${p.Name}** (${statusText}, deadline ${deadline})\n`;
    text += `   ID: ${p.Id}\n`;
    text += `   Valmistelija: ${p.OrganizationName ?? 'Ei ilmoitettu'}\n\n`;
  });

  return {
    content: [{ type: 'text', text }],
  };
}

export async function handleGetProposal(args: unknown) {
  const parsed = GetProposalSchema.parse(args);
  const proposalId = parsed.proposalId;

  // Fetch proposal details
  const propRes = await apiClient.get(`Proposals(guid'${proposalId}')`).json<ODataItem<Proposal>>();
  const p = propRes.d;

  // Fetch questions
  const qRes = await apiClient.get(`Proposals(guid'${proposalId}')/Questions`).json<ODataList<Question>>();
  const questions = qRes.d;

  const deadline = parseMsDate(p.Deadline) ?? 'Ei tiedossa';
  const closing = parseMsDate(p.ClosingDate) ?? 'Ei tiedossa';
  const isClosed = closing ? new Date(closing) < new Date() : false;
  const statusText = isClosed ? 'päättynyt' : 'avoin';

  let markdown = `# ${p.Name}\n\n`;
  markdown += `**Valmistelija:** ${p.OrganizationName ?? 'Ei ilmoitettu'} (ID: ${p.OrganizationId ?? 'Ei tiedossa'})\n`;
  markdown += `**Tila:** ${statusText}\n`;
  markdown += `**Lausunnon määräaika:** ${deadline}\n`;
  markdown += `**Päättymispäivä:** ${closing}\n`;
  if (p.RegisterNumber) {
    markdown += `**Diaarinumero:** ${p.RegisterNumber}\n`;
  }
  markdown += `\n## Tausta ja tavoitteet\n\n${p.Goals ?? 'Ei kuvausta.'}\n\n`;

  markdown += `## Lausuntokysymykset (${questions.length} kpl)\n\n`;
  if (questions.length === 0) {
    markdown += 'Ei lausuntokysymyksiä määritelty. Lausunto annetaan yleisellä kommentilla.\n';
  } else {
    // Sort questions by Order
    const sortedQuestions = [...questions].sort((a, b) => a.Order - b.Order);
    sortedQuestions.forEach((q) => {
      if (q.Type === 'questionType_PageBreak') {
        return; // Skip page breaks in listing
      }
      const mandatoryText = q.IsMandatory ? ' *(pakollinen)*' : '';
      markdown += `### Kysymys (Järjestys: ${q.Order})${mandatoryText}\n`;
      markdown += `${q.Header ?? 'Ei otsikkoa'}\n\n`;
    });
  }

  return {
    content: [{ type: 'text', text: markdown }],
  };
}
