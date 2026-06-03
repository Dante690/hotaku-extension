# Store listing — Hotaku Esports Odds Tracker

Copy/paste into the Chrome Web Store & Edge Add-ons listing forms.

---

## Name
Hotaku — Esports Odds Tracker

## Summary / Short description (≤132 chars)
**EN:** Live Hotaku esports prediction-market odds for the match you're watching on HLTV, Liquipedia, Twitch & op.gg.

**ES:** Odds de mercados de predicción de Hotaku para el partido de esports que estás viendo en HLTV, Liquipedia, Twitch y op.gg.

## Category
Tools (alt: Sports)

## Language
English (add Spanish as a secondary listing if desired)

---

## Detailed description

**EN:**

See live prediction-market odds for the esports match in front of you.

When you open a match on HLTV, Liquipedia, Twitch or op.gg, click the Hotaku icon to instantly see the implied win probability for each team — straight from Hotaku, decentralized prediction markets for esports settled in USDC on Solana.

✦ Supported games: Counter-Strike 2, League of Legends, Dota 2, VALORANT, EA Sports FC, Age of Empires and Brawl Stars.

✦ Supported sites: HLTV, Liquipedia, Twitch and op.gg.

How it works:
• Open a match page (e.g. an HLTV match) and click the toolbar icon.
• The extension reads the teams/game on the page and shows the matching Hotaku market.
• Each market shows both teams' implied probability, status (live / upcoming / finished) and a link to trade or view the market on hotaku.fun.

Privacy-first: the extension only reads the page when you click the icon, sends no personal data, and stores nothing about your browsing. The only request it makes is to Hotaku's public API to fetch market odds.

Not financial advice. Odds reflect market probability, not certainty.

Learn more: https://hotaku.fun

**ES:**

Consulta las odds de los mercados de predicción del partido de esports que tienes delante.

Cuando abras un partido en HLTV, Liquipedia, Twitch u op.gg, haz clic en el icono de Hotaku para ver al instante la probabilidad implícita de victoria de cada equipo — directamente desde Hotaku, mercados de predicción descentralizados de esports liquidados en USDC sobre Solana.

✦ Juegos: Counter-Strike 2, League of Legends, Dota 2, VALORANT, EA Sports FC, Age of Empires y Brawl Stars.

✦ Sitios: HLTV, Liquipedia, Twitch y op.gg.

Cómo funciona:
• Abre la página de un partido y haz clic en el icono.
• La extensión lee los equipos/juego de la página y muestra el mercado de Hotaku correspondiente.
• Cada mercado muestra la probabilidad implícita de ambos equipos, su estado (en vivo / programado / finalizado) y un enlace para negociar o consultar el mercado en hotaku.fun.

Respeta tu privacidad: la extensión solo lee la página cuando haces clic en el icono, no envía datos personales y no guarda nada sobre tu navegación. La única petición que hace es a la API pública de Hotaku para obtener las odds.

Esto no es asesoramiento financiero. Las odds reflejan la probabilidad del mercado, no una certeza.

Más información: https://hotaku.fun

---

## Privacy practices (the form questions)

**Single purpose:**
This extension has one purpose: to display Hotaku esports prediction-market odds for the match shown on the current tab.

**Justification — `activeTab` permission:**
Used only when the user clicks the toolbar icon. It lets the extension read the current page (team names and game) so it can look up the matching market on Hotaku. It is not used to track browsing, and no page data leaves the device except the game identifier sent to Hotaku's public API.

**Justification — host permission `https://api.hotaku.fun/*`:**
Needed to fetch public market odds from the Hotaku REST API (`GET /markets`). No authentication and no user data are sent — only the game filter (e.g. `?game=cs2`).

**Remote code:** No, the extension does not use remote code. All logic ships in the package.

**Data collection (check all that apply):** None. The extension does not collect or transmit personally identifiable information, health, financial, authentication, personal communications, location, web history, or user activity data.

**Data usage certifications (check the boxes):**
• I do not sell or transfer user data to third parties (outside approved use cases).
• I do not use or transfer user data for purposes unrelated to the item's single purpose.
• I do not use or transfer user data to determine creditworthiness or for lending.

**Privacy policy URL:** <PON_AQUÍ_LA_URL>  (e.g. https://hotaku.fun/privacy or the raw GitHub URL of PRIVACY.md)
