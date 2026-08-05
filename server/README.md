# video-analysis-service

Servidor que recibe la URL de un vídeo público (TikTok/Instagram/YouTube), lo descarga, transcribe y extrae tips de viaje con Groq, y guarda el resultado directamente en Supabase (tabla `places`, `category='video_tip'`). Lo llama el botón "Analizar" de la página `/tips-videos` de la app.

## Desplegado en Render

- **Root Directory:** `server`
- **Build Command:** `npm run build` (instala dependencias y descarga el binario de `yt-dlp`)
- **Start Command:** `npm start`
- **Runtime:** Node (nativo, sin Docker)

### Variables de entorno (panel de Render → Environment)

| Variable | Valor |
|---|---|
| `GROQ_API_KEY` | Clave de [console.groq.com](https://console.groq.com/keys) (gratis, sin tarjeta) |
| `SUPABASE_URL` | Mismo valor que `VITE_SUPABASE_URL` en `.env` de la app |
| `SUPABASE_ANON_KEY` | Mismo valor que `VITE_SUPABASE_PUBLISHABLE_KEY` en `.env` de la app |

Ninguna de estas claves debe estar nunca en el código ni en git — solo en el panel de Render.

### Cookies de Instagram (opcional, para que descargue reels que bloquea sin sesión)

Instagram bloquea a veces la descarga anónima de reels públicos. Para evitarlo, yt-dlp puede usar las cookies de una sesión de Instagram ya logueada:

1. Instala la extensión de navegador **"Get cookies.txt LOCALLY"** (Chrome/Firefox/Edge).
2. Con la extensión instalada, entra en **instagram.com** ya logueada con tu cuenta.
3. Pulsa el icono de la extensión → exporta/descarga el `cookies.txt` de ese sitio.
4. En Render → tu servicio → pestaña **"Environment"** → sección **"Secret Files"** → añade un fichero nuevo:
   - **Filename** (ruta donde Render lo monta): `/etc/secrets/instagram_cookies.txt`
   - **Contents:** pega el contenido del `cookies.txt` descargado.
5. Añade la variable de entorno `INSTAGRAM_COOKIES_PATH` = `/etc/secrets/instagram_cookies.txt`.
6. Redeploy del servicio (Render suele hacerlo solo al guardar).

Este fichero es una sesión personal de Instagram — nunca debe subirse a git ni compartirse; Render lo guarda cifrado y no lo expone en el código. Si las cookies caducan (cierre de sesión, cambio de contraseña...), hay que repetir el proceso.

## Desarrollo local

```
cd server
npm install
GROQ_API_KEY=... SUPABASE_URL=... SUPABASE_ANON_KEY=... npm start
```

En local usa el `yt-dlp` instalado por `brew` (debe estar en el `PATH`). En Render, `npm run build` descarga el binario standalone y el servidor lo detecta automáticamente (ver `LOCAL_YTDLP` en `server.mjs`).

## Endpoint

`POST /analyze` con body `{ "url": "https://..." }` → descarga, transcribe, extrae tips y guarda en Supabase. Devuelve `{ title, cityId, tips, platform, row }`.

Limitación conocida: Instagram a veces bloquea la descarga de posts públicos sin sesión iniciada (protección anti-bot de Meta). TikTok funciona de forma fiable.
