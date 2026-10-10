# LEE ME — eLoco Productions // PSYCH-BRUTALISM RAVE & TECH GEAR PORTAL (v2.0)

Guía completa del sitio web: brand kit, sistema de estilos, tipografías, assets, CSS, JS, backend de pagos, comandos y despliegue.

**v2.0 — doble vertiente:** 01 EVENTOS (raves, lineup, tickets) + 02 ALQUILER DE EQUIPO TÉCNICO (catálogo audio/luces/FX + Tech Rider Builder `#cotizador` en 5 pasos).

- **Idioma del sitio:** español (locale `es_GT`, Guatemala)
- **Estilo:** Brutalismo psicodélico rave (Psych-Brutalism) — negro profundo, neones ácidos, bordes duros, sombras sólidas sin blur, monoespaciada
- **Stack:** HTML5 + CSS3 (tokens puros) + JavaScript ES6 vanilla **sin dependencias de runtime** + Bootstrap 5.3.3 (CDN, solo utilidades base)
- **Moneda:** GTQ (quetzal) primario + USD de referencia (tipo de cambio fijo `7.75`) + IVA 12%
- **Estatutos:** sitio estático autocontenido; backend de pagos opcional en `server/` (Node sin dependencias)

---

## 1. Brand Kit

| Elemento | Valor |
|---|---|
| Marca | **eLoco Productions** (`eLoco/PRODUCTIONS` en header) |
| Título/OG | `eLoco Productions // PSYCH-BRUTALISM RAVE & TECH GEAR PORTAL` |
| Tagline hero | `MÚSICA QUE / REESCRIBE / LA NOCHE` (tercera línea en outline) |
| Logo | `img/LOGO.png` (46×46 en header, usado también como `og:image` y favicon) |
| Favicon | `img/LOGO.png` (`rel="icon"`) |
| Theme color | `#080808` |
| Locale / OG | `es_GT` — `og:type=website`, `twitter:card` |
| Voz / tono | Crudo, técnico, “terminal de rave”: mayúsculas, prefijos `//`, `[ ETIQUETAS ]`, cero emoji |

### 1.1 Paleta oficial (Brand Colors)

| Token | Hex | Uso |
|---|---|---|
| `--acid-green` | `#39FF14` | Acento primario: CTA, foco, glow, progreso |
| `--electric-violet` | `#8A2BE2` | Acento secundario: gradientes, blobs |
| `--neon-orange` | `#FF5F1F` | Acento terciario: alertas/energía |
| `--cyber-pink` | `#FF007F` | Acento cuaternario: hover chroma, blobs |
| `--neon-cyan` | `#00FFFF` | Highlight, aberración RGB |
| `--neon-red` | `#FF073A` | Errores, sold-out, cerrar |
| `--color-bg-deep` | `#080808` | Fondo global |
| `--color-bg-darker` | `#0D0B14` | Paneles (checkout, modal pago) |
| `--color-bg-card` | `#111111` | Tarjetas |
| `--color-border` / `--color-border-bright` | `#1A1A1A` / `#2A2A2A` | Bordes sutiles / brillantes |
| `--color-text-primary/secondary/muted` | `#FFFFFF` / `#B0B0B0` / `#666666` | Jerarquía de texto |

**Gradientes oficiales**
- `--gradient-primary`: 135° acid-green → electric-violet (CTAs, dividers)
- `--gradient-secondary`: 135° neon-orange → cyber-pink
- `--gradient-tertiary`: 135° electric-violet → neon-cyan
- `--gradient-radial`: radial acid-green transparent (glow hero)
- `--gradient-noise`: SVG `feTurbulence` inline al 3% (grano sobre todo el body)

### 1.2 Tipografías (Google Fonts)

| Rol | Familia | Pesos cargados | CSS |
|---|---|---|---|
| Display / titulares | **Space Grotesk** | 400, 500, 600, 700 | `--font-display` |
| Mono / etiquetas UI | **JetBrains Mono** | 400, 500, 600, 700, 800 | `--font-mono` |
| Body / lectura | **IBM Plex Mono** | 400, 500, 600 | `--font-body` |

Cargadas con `display=swap` + `preconnect`. Fallbacks: `Syne` (display), `Fira Code`/`SF Mono` (mono), `system-ui`.

**Escala tipográfica fluida** (`clamp()`, de `--fs-xs` a `--fs-5xl`): 0.7rem → 8.5rem reactiva al ancho de viewport.

---

## 2. Estructura de archivos

```
SitioWeb/
├── index.html                    # Documento único (todas las secciones)
├── loco-theme.css                # Estilos principales (secciones 0–13)
├── design-tokens.css             # 75 variables — fuente de verdad del sistema
├── loco-engine.js                # Motor JS (módulos 1–14)
├── img/
│   └── LOGO.png                  # Logo/OG/favicon (~725 KB)
├── scripts/
│   ├── build.js                  # Validación + empaquetado → dist/ + zip
│   ├── serve.js                  # Servidor estático local (:4173)
│   ├── api-test.js               # Tests E2E del backend (15 aserciones)
│   └── headless-test.js          # Tests UI headless Edge (55 aserciones)
├── server/
│   ├── server.js                 # API de pagos + estáticos (:8787)
│   ├── gateways.js               # Adaptadores de pasarelas
│   └── .env.example              # Plantilla de configuración
├── package.json                  # Scripts npm
├── vercel.json / netlify.toml / .htaccess / robots.txt   # Despliegue
├── .gitignore / .vercelignore
├── Leeme.md                      # Este archivo
└── blueprint_elocoproductions.md # Blueprint técnico/arquitectura
```

Build resultante: `dist/` (6 archivos + `img/`) y `locoproductions-dist.zip` (~766 KB).

---

## 3. Sistema de estilos (CSS)

### 3.1 Arquitectura

- `design-tokens.css` se importa con `@import url("design-tokens.css")` como **primera línea** de `loco-theme.css` → cambiar un token actualiza todo el sitio.
- Reset global propio (`box-sizing`, márgenes en 0), `body` con grano `--gradient-noise`, `::selection` verde ácido, scrollbar custom.
- **Radio de borde global = 0** (brutalismo puro); sombras sólidas desplazadas (`4px 4px 0`), nunca blur para bordes.

### 3.2 Mapa de secciones de `loco-theme.css`

| # | Sección | Contenido clave |
|---|---|---|
| 0 | UTILITIES | Utilidades tipográficas/de color |
| 1 | LIVE TICKER | Barra fija superior con countdown del próximo evento |
| 2 | HEADER | Fijo, 80px, nav + **conmutador de modo dual** (`[ 01 // EVENTOS ]` / `[ 02 // ALQUILER DE EQUIPO ]`) + menú móvil + estado `is-scrolled`/`is-glide` |
| 3 | HERO | Título gigante, glow radial, grid de fondo, radio player, stats |
| 4 | SECTIONS | Calendario de eventos, botones, acordeón base |
| 5 | LINEUP | Grid de artistas, filtros por género, reveal de set info |
| 6 | TIERS / TICKETS | Cards de tier, selector de cantidad, checkout sticky, modal de pago |
| 7 | GALLERY | Experiencias/galería filtrable + aftermovie 21:9 |
| 8 | FOOTER | Protocolo, políticas (acordeón), guestlist, créditos |
| 9 | MODAL | Backdrop + diálogo genérico |
| 10 | REVEAL ON SCROLL | Entrada 3D `rotateX` + fade |
| 11 | CINEMA FX | Canvas, cursor, tilt, progreso, chroma (ver §6) |
| 12 | ALQUILER (catálogo) | 3 `.gear-set` (audio boutique/warehouse/festival) + 6 `.fx-card` (luces/láser/UV/hazer/LED) + CTA a cotizador |
| 13 | COTIZADOR | 5 `fieldset` de pasos + resumen sticky (`.cot-side`) con subtotal/IVA/total GTQ/USD |

### 3.3 Capas (z-index)

| Capa | z-index | Token |
|---|---|---|
| Skip link | 2000 | — |
| Cursor FX | 1200 | — |
| Barra progreso scroll | 1100 | — |
| Live ticker | 1000 | `--z-ticker` |
| Header | 900 | `--z-header` |
| Modal pago + Modal genérico | 900 | `calc(--z-modal + 100)` (gana el que va después en el DOM) |
| FX canvas (screen) | 4 | — |
| Dropdown/tooltip | 600/700 | `--z-dropdown`/`--z-tooltip` |

### 3.4 Responsividad y accesibilidad

- Breakpoints clave: móvil `≤767.98px` (checkout 1 col, métodos 2×n), tablet, desktop.
- `prefers-reduced-motion: reduce`: anula transiciones (tokens a 0ms), reveal visible estático, FX desactivados.
- `@media (pointer: coarse)`: oculta cursor FX en táctil.
- Foco visible global `2px solid --accent-primary`; ARIA en ticker (`aria-live`), tabs de filtros/métodos (`role=tab`), modal (`role=dialog`, `aria-modal`).

---

## 4. Contenido y datos

### 4.1 Eventos (sección `#eventos`)

| Evento | Precio | Estado |
|---|---|---|
| NEON CIRCUIT // VOL.07 | DESDE Q450 | Activo |
| CEREBRO SINTÉTICO FEST | DESDE Q680 | Activo |
| AFTERMATH: CLOSING RITUAL | — | AGOTADO |

### 4.2 Lineup (renderizado por JS, 10 artistas)

Filtros (taxonomía v2.0 con BPM): `TODO / HARD TECHNO & INDUSTRIAL 135–160 BPM / PSYTRANCE & FOREST 138–190 BPM / CYBER-GOTH & EBM 120–140 BPM / POST-TRANCE & NEO-RAVE 130–145 BPM` (clase `.is-hidden` para ocultar).

Artistas: VOLTAGE_KR (cyber-goth), NEURON (psytrance), HELLGRID (hard-techno), MASCHINE (hard-techno), AETHER WAVE (post-trance), DEAD CIRCUIT (cyber-goth), PSYCHOGLIDE (psytrance), RHYTHM_Ø (cyber-goth), NULL POINTER (hard-techno), LUCID DRIFT (post-trance) — cada uno con género, escenario (MAINFRAME/CORTEX/REACTOR/SUNSET), horario, banda de frecuencia y **root frequency** para su preview de audio sintetizado.

### 4.3 Tiers / Boletos (sección `#tickets`)

| Tier ID | Nombre | Precio GTQ | Ref. USD | Estado |
|---|---|---|---|---|
| `early` | EARLY BIRD | Q290 | ~$37 | **AGOTADO** |
| `tier1` | TIER 1 GENERAL (recomendado) | Q450 | ~$58 | Activo |
| `vip` | VIP / BACKSTAGE | Q950 | ~$123 | Activo |
| `after` | AFTER-HOURS PASS | Q300 | ~$39 | Activo |

Cantidad 1–10. Total se muestra en GTQ (`#coTotal`) + USD (`#coTotalUsd`) con tasa `7.75`.

### 4.4 Alquiler de equipo (sección `#alquiler`)

Catálogo de la vertiente 02: 3 paquetes de audio (Boutique ≤150 pax `Q3,500` / Warehouse 150–500 pax `Q8,000` / Festival 1,000+ pax `Q40,000` con marcas QSC/JBL/EV, d&b, Meyer, Dante/fibra) + 6 módulos FX (láser RGB ILDA/FB4, beam 1.5°–3°, tubos LED Astera/Chauvet, UV 365–395nm, hazer DMX 1500W, pantalla LED exterior) con CTA al cotizador.

### 4.5 Cotizador (sección `#cotizador` — Tech Rider Builder)

5 pasos: (01) tipo de evento `[UR]/[PC]/[CG]/[PT]/[PV]`, aforo, departamento, suministro eléctrico (red / planta diésel +Q4,500); (02) kit base; (03) módulos de luz/láser/FX con cantidad de beam; (04) soporte en campo (FOH, diseñador de luz, NRD-2/NRD-4 CONRED); (05) datos FEL (razón social, NIT, correo, teléfono).

Resumen sticky: subtotal + IVA 12% + total GTQ + ref. USD. Acciones: `[ GENERAR TECH RIDER // ENVIAR A REVISIÓN ]` (modal con folio `RIDER-GT-XXXX` + mailto a `pagos@locoproductions.gt`) y `[ EXPORTAR EN WHATSAPP CON FORMATO RAW ]` (`wa.me` con el rider en texto plano, `#cotRaw`).

### 4.6 Otras secciones

- **Experiencias** (`#experiencias`): galería filtrable por color + aftermovie teaser 21:9 con botón play simulado.
- **Footer/Protocolo** (`#protocolo`): políticas en acordeón (acceso, confirmación, pagos y reembolsos con FEL y métodos, waste/leave-no-trace, permisos CONRED, alquiler y FEL), guestlist secreta (valida email/teléfono), contacto `guestlist@locoproductions.gt` / `pagos@locoproductions.gt`.
- **Stats hero**: contadores animados (eventos, artistas, **kW acústicos**, asistentes).

---

## 5. JavaScript — `loco-engine.js` (módulos 1–14)

IIFE única, cero dependencias, API pública: `LOCO = { countdown, Modal, cinema }`.

| # | Módulo | Función |
|---|---|---|
| 1 | COUNTDOWN | Ticker en vivo + estados (próximo drop) — formato `DD:HH:MM:SS` |
| 2 | HEADER + NAV | Menú móvil, scroll-spy, conmutador de modo dual (eventos/alquiler), estado `is-scrolled` |
| 3 | AUDIO ENGINE | **`LocoAudioEngine` (Web Audio API sintetizado)**: kick sine 150→40Hz, bass saw + lowpass Q7.5, hat 7000Hz; secuenciador 142 BPM / 16 pasos sobre `ctx.currentTime`; `AnalyserNode fftSize=64` |
| 4 | HERO RADIO | Loop 142 BPM sintetizado + **waveform en `<canvas id="waveform">`** en tiempo real + play/pause |
| 5 | LINEUP | Render de artistas, filtros por género, preview de audio por artista |
| 6 | TICKETS | Selector tier/cantidad, checkout, `getState()` → `{selected, qty, total}` |
| 6B | PAGO | Modal `#pagoSeguro`: métodos, validación Luhn/exp/CVV/titular/email, flujo `runFlow()` demo/live, folios `LOC-GT-AAAAMMDD-XXXX`, `closePay()` (Escape/backdrop/botón) |
| 6C | COTIZADOR | Tech Rider Builder: kits/módulos/servicios, IVA 12%, ref. USD, validación FEL, generación de rider (folio `RIDER-GT-XXXX` + mailto + `wa.me` + `#cotRaw`) |
| 7 | ACORDEÓN | Políticas |
| 8 | REVEAL | IntersectionObserver → `.is-visible` |
| 9 | COUNTERS | Stats animados |
| 10 | AFTERMOVIE | Toggle del teaser |
| 11 | GUESTLIST | Form con validación (email/teléfono) + confirmación modal |
| 12 | MODAL | Modal genérico accesible |
| 13 | CINEMA FX | Efectos psicodélicos (ver §6) |
| 14 | CIERRE | Pausa audio al perder foco de pestaña |

**Configuración de pago** (línea ~33):

```js
const PAY = { modo: 'demo', endpoint: '/api/pago' };
```

- `modo: 'demo'` → flujo local (sin red) con modal “APROBADO (DEMO)” honesto.
- `modo: 'live'` → `fetch POST endpoint` con `{tier, qty, amount, currency:'GTQ', method, email}`; si la respuesta trae `checkoutUrl` redirige a la pasarela; si trae `reference` muestra referencia manual.

---

## 6. FX Cinemáticas (PSYCH-BRUTALISM FX)

Implementados en el módulo 13 (JS) + sección 11 (CSS):

1. **Canvas aurora** `#fxCanvas` — fijo, `mix-blend-mode: screen`, z=4; 3 blobs orbitando que siguen al puntero (tonos 130/275/330) + ~90 partículas atraídas al mouse; intensidad ligada a velocidad de mouse y scroll.
2. **Cursor psicodélico** — ring + dot con lerp, `mix-blend-mode: difference`, crece sobre elementos interactivos (`.is-hot`).
3. **Tilt 3D** en tarjetas (`.event-card`, `.artist-card`, `.tier-card`, `.aftermovie`, `.manifesto`, `.gear-set`, `.fx-card`, `.cot-kit`) — `rotateX/rotateY` + gloss radial que sigue `--gx/--gy`.
4. **Parallax mouse** — variables globales `--mx/--my/--mxn/--myn` (hero glow, grid de fondo, aberración RGB del título).
5. **Scroll** — barra arcoíris `#scrollProgress` (z=1100), `--sy` (parallax), header `is-glide` por velocidad.
6. **Reveal 3D** — `perspective(1100px) rotateX(16deg)` → `none`.
7. **Chroma hover** en títulos + divider con gradiente animado (`dividerFlow`).

Guardas: desactivados con `prefers-reduced-motion` o puntero grueso.

---

## 7. Backend de pagos (`server/`)

### 7.1 Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | `{ ok, gateway }` |
| POST | `/api/pago` | `{tier, qty, amount, currency:'GTQ', method, email}` → `{ok, folio, checkoutUrl \| reference}` |
| POST | `/api/webhook/:gw` | Webhook firmado HMAC-SHA256 (`x-loco-signature`) → 200/401 |
| * | `/...` | Estáticos desde `dist/` (fallback a raíz) |

Métodos: `TARJETA | PAYPAL | ZIGI | TRANSFERENCIA | QR` (últimos dos → referencia manual).

### 7.2 Seguridad

- Precio **siempre** recalculado server-side desde whitelist de tiers (monto falsificado → `400 MONTO_NO_COINCIDE`; tier agotado → `403`).
- Nunca cobro desde el navegador: solo se devuelve `checkoutUrl` hospedada/tokenizada.
- Idempotencia (15 min) por `Idempotency-Key`, rate-limit por IP (10 tokens), límite de cuerpo 64 KB.
- Webhooks HMAC-SHA256 con comparación timing-safe; `WEBHOOK_SECRET` obligatorio.
- CORS opcional (`CORS_ALLOW_ORIGIN`) si el backend va en otro dominio.

### 7.3 Adaptadores (`server/gateways.js`)

| Adaptador | Estado | Notas |
|---|---|---|
| `demo` | Listo | Sandbox interno, no cobra |
| `paypal` | **Real** (Orders v2) | Sandbox/live; cobra USD equivalente (GTQ→USD ÷ 7.75) porque PayPal no soporta GTQ |
| `qpaypro` | Scaffold GT | Hosted checkout: poblar `QPAYPRO_*` |
| `zigi` | Scaffold GT | Poblar `ZIGI_*` |
| `pagadito` | Scaffold GT | Poblar `PAGADITO_*` |
| `recurrente` | Scaffold GT | Poblar `RECURRENTE_*` |

Sin credenciales → `503` con mensaje honesto (`*_NO_CONFIGURADO`).

### 7.4 Configuración

Copiar `server/.env.example` → `server/.env`:

```bash
PORT=8787
PUBLIC_URL=https://tu-dominio.gt
GATEWAY=demo            # demo|qpaypro|zigi|paypal|pagadito|recurrente
WEBHOOK_SECRET=<hex 32 bytes>
RATE_GTQ_PER_USD=7.75
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID= / PAYPAL_CLIENT_SECRET=
# + QPAYPRO_*, ZIGI_*, PAGADITO_*, RECURRENTE_*
```

**Para live:** `GATEWAY=<pasarela>` + credenciales + `loco-engine.js` → `PAY.modo = 'live'` + HTTPS obligatorio + probar en sandbox primero.

---

## 8. Assets

| Asset | Ruta | Uso |
|---|---|---|
| LOGO.png | `img/LOGO.png` (~725 KB) | Header (46×46), `og:image`, favicon |
| Audio | — | **No hay archivos**: todo el audio es sintetizado con Web Audio API |
| Gradiente de ruido | Inline SVG data-URI | Grano psicodélico sobre el body |
| Iconos | Texto/ASCII (`[ X ]`, `//`) | Estética terminal, sin librería de iconos |

Externos (CDN con SRI): Bootstrap 5.3.3 CSS+JS, Google Fonts.

---

## 9. Comandos

| Comando | Qué hace |
|---|---|
| `npm run check` | Valida JS/HTML/CSS/IDs/refs (65 IDs requeridos) |
| `npm run build` | Valida + genera `dist/` + `locoproductions-dist.zip` |
| `npm run serve` | Servidor estático local en `http://localhost:4173` |
| `npm run backend` | Backend de pagos en `http://localhost:8787` |
| `npm run test:api` | 15 tests E2E de la API (pago, webhooks, estáticos) |
| `npm run test:ui` | 55 tests headless Edge (FX, modal, validación, cotizador v2, responsive) |

Requisito: Node ≥ 18. Los tests UI usan Edge headless local y no requieren red.

---

## 10. Despliegue

- **Paquete:** subir contenido de `dist/` (o el zip) — sitio 100% estático.
- **Vercel:** `vercel.json` (`cleanUrls`, cache de assets 86400s immutable); `.vercelignore` excluye `scripts/`, `server/`, docs.
- **Netlify:** `netlify.toml` (redirects/headers equivalentes).
- **Apache:** `.htaccess` (HTTPS, compresión, cache, headers de seguridad).
- **SEO:** `robots.txt` + meta description + OG/Twitter cards completos.
- **Backend:** correr `node server/server.js` en un host Node (VPS/Render/Railway) apuntando `PUBLIC_URL` al dominio; si va en otro origen, setear `PAY.endpoint` a la URL completa + `CORS_ALLOW_ORIGIN`.

---

## 11. Verificación continua

- `test:api` (15/15): checkout demo, idempotencia, rechazo de monto falsificado/tier agotado/moneda USD, transferencia→referencia, PayPal 503 sin credenciales, webhook firma válida/inválida/ausente, estáticos.
- `test:ui` (55/55): FX (canvas pintado, tilt, `--mx`, progreso de scroll), modal (abre/cierra/Escape/backdrop/foco/bloqueo de scroll), validación de tarjeta (rechaza inválida, aprueba demo con folio), precios GTQ/USD, filtros por subgénero v2, acordeón, secciones `#alquiler`/`#cotizador`, waveform canvas, countdown `DD:HH:MM:SS`, modo dual (clic + scroll-spy), cotizador (defaults, kit `Q3,500`, módulos → `Q15,400`/`Q1,848`/`Q17,248`/`≈ $2,226`, validación FEL, folio `RIDER-GT` en modal, `wa.me` + `#cotRaw`), 0 referencias MX, 0 `jsErrors`, overflow móvil ≤ 0.

**Nota harness:** el test copy elimina `defer` de `loco-engine.js` para evitar la carrera entre el motor y el timer de pruebas bajo `--virtual-time-budget`.

**Convenciones:** UI y comentarios en español; sin emoji en archivos no-Markdown; YAML con un solo newline final; cero dependencias de runtime.
