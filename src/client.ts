import got from 'got';

export const apiClient = got.extend({
  prefixUrl: 'https://www.lausuntopalvelu.fi/api/v1/Lausuntopalvelu.svc',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 lausuntopalvelu-mcp/1.0',
    'Accept': 'application/json;odata=verbose',
    'Accept-Language': 'fi-FI,fi;q=0.9,en;q=0.8',
  },
  timeout: { request: 15000 },
  retry: {
    limit: 3,
    statusCodes: [429, 503],
    backoffLimit: 4000,
  },
});

// Muuntaa OData-päivämäärän "/Date(1436227199000)/" → "YYYY-MM-DD"
export function parseMsDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const match = raw.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
  if (!match) return null;
  const ms = parseInt(match[1], 10);
  if (isNaN(ms)) return null;
  const d = new Date(ms);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
