# Testausohje: Antigravity-käyttöönotto ja manuaalinen testaus (HTTP/SSE)

Tämä ohje kuvaa, miten `lausuntopalvelu-mcp` -palvelin otetaan käyttöön Google Antigravity -kehitysympäristössä käyttäen HTTP/SSE-transportia.

---

## 📋 Esiehdot

1. Asenna riippuvuudet ja rakenna projekti:
   ```bash
   npm install
   npm run build
   ```
2. Käynnistä HTTP/SSE-palvelin taustalle:
   ```bash
   npm run start:http
   ```
   Oletuksena palvelin käynnistyy porttiin `3000`. Voit vaihtaa porttia `PORT`-ympäristömuuttujalla:
   ```bash
   PORT=4000 npm run start:http
   ```

3. Varmista, että palvelin vastaa oikein:
   ```bash
   curl -v http://localhost:3000/sse
   ```
   Odotettu vastaus sisältää otsikon `Content-Type: text/event-stream` ja alustaa istunnon.

---

## ⚙️ Antigravity-konfiguraatio

Voit rekisteröidä palvelimen Antigravityyn joko työtilakohtaisesti (suositeltu) tai asetusten kautta.

### Vaihtoehto A: Työtilakohtainen konfiguraatio (`.agents/mcp_config.json`)
Luo projektin juureen kansio `.agents/` ja sinne tiedosto `mcp_config.json`:

```json
{
  "mcpServers": {
    "lausuntopalvelu": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```

### Vaihtoehto B: Asetusten kautta (TUI / IDE)
1. Avaa Antigravity-asetukset.
2. Siirry kohtaan **MCP / Integrations**.
3. Lisää uusi palvelin:
   * **Name:** `lausuntopalvelu`
   * **URL / Endpoint:** `http://localhost:3000/sse`
   * **Transport:** `SSE`

---

## 🧪 Smoke-testit

Kun yhteys on muodostettu, voit suorittaa seuraavat testit Antigravity-agentille varmistaaksesi toiminnan:

| # | Syöte agentille | Odotettu tulos | Kutsuttava työkalu |
|---|---|---|---|
| **T1** | *"Hae lausuntopyyntöjä aiheesta liikenne"* | Palauttaa listauksen avoimista lausuntopyynnöistä liittyen liikenteeseen. | `search_proposals` |
| **T2** | *"Näytä lausuntopyyntö ID:llä [UUID]"* | Tulostaa ehdotuksen tiedot, taustat ja numeroidut kysymykset Markdownina. | `get_proposal` |
| **T3** | *"Hae uusimmat avoimet lausuntopyynnöt"* | Palauttaa 20 uusinta avointa lausuntopyyntöä. | `search_proposals` |
| **T4** | Sammuta palvelin ja yritä kutsua | Agentti ilmoittaa yhteysvirheestä (Connection Refused). | - |
| **T5** | Käynnistä palvelin uudelleen | Auto-reconnect yhdistää palvelimen takaisin ilman asetusten uudelleenlatausta. | - |

---

## 🛠️ Virheiden diagnosointi

*   **`Connection Refused` / Yhteys ei muodostu:**
    *   Tarkista, että node-prosessi on käynnissä: `ps aux | grep node`.
    *   Tarkista, ettei jokin toinen prosessi varaa porttia 3000: `lsof -i :3000`.
*   **CORS-virheet selaimessa / IDE:ssä:**
    *   Express-palvelimessa on otettu käyttöön `Access-Control-Allow-Origin: *` -otsake. Varmista, ettei välissä oleva palomuuri tai proxy estä pyyntöjä.
*   **Reverse Proxy / Nginx 404 tai yhteys pätkii:**
    *   Jos käytät Nginxiä tai vastaavaa proxy-palvelinta, poista puskurointi käytöstä SSE-yhteydelle:
        ```nginx
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        ```
