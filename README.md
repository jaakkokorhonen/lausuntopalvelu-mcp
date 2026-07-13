# lausuntopalvelu-mcp

Model Context Protocol (MCP) -palvelin lausuntopalvelu.fi-sivuston OData-rajapinnan lukemiseen. Palvelin mahdollistaa lausuntopyyntöjen haun, lukemisen ja analysoinnin suoraan tekoälyasiakkailla (kuten Claude Desktop, Cursor ja Antigravity).

---

## 🚀 Ominaisuudet ja työkalut

Palvelin tarjoaa seuraavat MCP-työkalut:

*   `search_proposals` — Hae lausuntopyyntöjä otsikon tai valmistelijan perusteella suoraan palvelinpään suodatuksella. Parametrit: `query` (vapaaehtoinen), `status` (`open` | `closed` | `all`, oletus `all`), `limit` (max 100).
*   `get_proposal` — Hae yksittäisen lausuntopyynnön tiedot ja numeroidut kysymykset UUID-tunnuksella. Parametrit: `proposalId` (UUID, pakollinen).

---

## 📦 Pika-asennus

### Esiehdot
*   Node.js 20+
*   npm

### Asennus ja käännös
Kloonaa repository, asenna riippuvuudet ja käännä TypeScript-tiedostot:
```bash
git clone https://github.com/jaakkokorhonen/lausuntopalvelu-mcp.git
cd lausuntopalvelu-mcp
npm install
npm run build
```

---

## ⚙️ Asiakaskohtainen konfigurointi

### 1. Claude Desktop
Lisää palvelin Claude Desktopin konfiguraatioon:
*   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
*   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "lausuntopalvelu": {
      "command": "node",
      "args": ["/absoluuttinen/polku/lausuntopalvelu-mcp/dist/index.js"]
    }
  }
}
```

### 2. Cursor
Lisää projektikohtainen tai globaali konfiguraatio:
*   **Projektikohtainen:** Luo tiedosto `.cursor/mcp.json` työtilan juureen:

```json
{
  "mcpServers": {
    "lausuntopalvelu": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/absoluuttinen/polku/lausuntopalvelu-mcp"
    }
  }
}
```

### 3. Antigravity (HTTP/SSE transport)
Antigravity yhdistää palvelimeen verkon yli. Käynnistä ensin HTTP/SSE-serveri taustalle:
```bash
npm run start:http
```
Palvelin käynnistyy porttiin `3000`. Lisää `.agents/mcp_config.json` -tiedosto tai määritä Antigravityn asetuksista:
*   **URL:** `http://localhost:3000/sse`
*   **Transport:** `SSE`

Katso tarkempi ohje: [docs/testing-antigravity.md](docs/testing-antigravity.md).

---

## 🛠️ Kehitys ja testaus

*   Käynnistä kehityspalvelin live-reloadilla: `npm run dev`
*   Rakenna tuotantoversio: `npm run build`
