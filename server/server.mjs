#!/usr/bin/env node
// Servidor público (pensado para desplegarse en Render) que recibe una URL de un vídeo
// público de TikTok/Instagram/YouTube, lo descarga, lo transcribe y extrae tips de viaje
// con Groq (gratis, sin tarjeta), y guarda el resultado directamente en Supabase
// (tabla `places`, category='video_tip' — ver .agent/knowledge/07-app-lovable.md).
//
// Variables de entorno necesarias (se configuran en el panel de Render, NUNCA en el código):
//   GROQ_API_KEY            clave de console.groq.com
//   SUPABASE_URL            misma que VITE_SUPABASE_URL de la app
//   SUPABASE_ANON_KEY       misma que VITE_SUPABASE_PUBLISHABLE_KEY de la app
//   YTDLP_PATH (opcional)   ruta al binario yt-dlp, por defecto "yt-dlp" (debe estar en PATH)
//   PORT (opcional)         puerto, Render lo inyecta solo

import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { promises as fs, existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 8787;
// En Render, el build descarga el binario standalone de yt-dlp junto al servidor (ver README.md).
// En local (Mac), se usa el yt-dlp instalado por brew, disponible en el PATH.
const LOCAL_YTDLP = path.join(__dirname, 'yt-dlp');
const YTDLP_PATH = process.env.YTDLP_PATH || (existsSync(LOCAL_YTDLP) ? LOCAL_YTDLP : 'yt-dlp');
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Ciudades de la ruta (fijas para este viaje) — se usan para que Groq pueda mapear
// el vídeo a un cityId real de la app en vez de inventarse uno.
const CITIES = [
  { id: 'beijing', name: 'Beijing' },
  { id: 'xian', name: "Xi'an" },
  { id: 'chengdu', name: 'Chengdu' },
  { id: 'chongqing', name: 'Chongqing' },
  { id: 'fenghuang', name: 'Fenghuang' },
  { id: 'furong', name: 'Furong' },
  { id: 'zhangjiajie', name: 'Zhangjiajie' },
  { id: 'wulingyuan', name: 'Wulingyuan' },
  { id: 'shangrao', name: 'Wangxian Valley (Shangrao)' },
  { id: 'shanghai', name: 'Shanghai' },
];
const NO_CITY = 'none';

function detectPlatform(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('tiktok.com')) return 'tiktok';
    if (host.includes('instagram.com')) return 'instagram';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
    return 'other';
  } catch {
    return 'other';
  }
}

async function downloadVideo(url, workdir) {
  await execFileAsync(YTDLP_PATH, [
    '--no-playlist',
    '--write-description',
    '--write-info-json',
    '-o', path.join(workdir, 'video.%(ext)s'),
    url,
  ], { timeout: 5 * 60 * 1000, maxBuffer: 20 * 1024 * 1024 });

  const files = await fs.readdir(workdir);
  const videoFile = files.find(f => f.startsWith('video.') && !f.endsWith('.json') && !f.endsWith('.description'));
  if (!videoFile) throw new Error('yt-dlp no generó ningún fichero de vídeo');

  let title = '';
  const infoFile = files.find(f => f.endsWith('.info.json'));
  if (infoFile) {
    try {
      const info = JSON.parse(await fs.readFile(path.join(workdir, infoFile), 'utf8'));
      title = info.title || '';
    } catch { /* ignore */ }
  }

  let caption = '';
  const descFile = files.find(f => f.endsWith('.description'));
  if (descFile) {
    caption = await fs.readFile(path.join(workdir, descFile), 'utf8');
  }

  return { videoPath: path.join(workdir, videoFile), title, caption };
}

async function extractAudio(videoPath, workdir) {
  const audioPath = path.join(workdir, 'audio.wav');
  await execFileAsync(ffmpegPath, ['-y', '-i', videoPath, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', audioPath], {
    timeout: 2 * 60 * 1000,
  });
  return audioPath;
}

async function transcribeAudio(audioPath) {
  const buffer = await fs.readFile(audioPath);
  const form = new FormData();
  form.append('file', new Blob([buffer]), 'audio.wav');
  form.append('model', 'whisper-large-v3-turbo');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Groq (transcripción) devolvió ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.text || '';
}

async function extractTips({ title, caption, transcript }) {
  const cityList = CITIES.map(c => `${c.id} = ${c.name}`).join(', ');
  const prompt = `Eres un asistente que ayuda a extraer tips de viaje de vídeos de TikTok/Instagram sobre un viaje a China.
Ciudades válidas de la ruta (usa el id exacto o "${NO_CITY}" si no aplica a ninguna): ${cityList}.

Título del vídeo: ${title || '(sin título)'}
Caption/descripción original: ${caption || '(sin descripción)'}
Transcripción del audio: ${transcript || '(sin audio hablado relevante)'}

Devuelve SOLO un JSON con esta forma exacta, sin explicaciones:
{
  "title": "resumen corto y claro del vídeo (máx 80 caracteres)",
  "cityId": "uno de los ids de la lista, o \\"${NO_CITY}\\"",
  "tips": ["tip concreto y accionable 1", "tip concreto y accionable 2", "..."]
}
Los tips deben ser frases cortas, concretas y accionables (sitios, precios, trucos, horarios, apps, comida...), en español, basadas solo en lo que dice el vídeo. Si no hay tips claros, devuelve un array vacío.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`Groq (extracción) devolvió ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return {
    title: parsed.title || title || 'Vídeo sin título',
    cityId: CITIES.some(c => c.id === parsed.cityId) ? parsed.cityId : NO_CITY,
    tips: Array.isArray(parsed.tips) ? parsed.tips.filter(Boolean) : [],
  };
}

async function saveToSupabase({ url, platform, title, cityId, tips, caption, transcript }) {
  const id = `vt-${Date.now()}`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/places`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      id,
      category: 'video_tip',
      city_id: cityId || NO_CITY,
      name: title,
      alt_name: platform,
      url,
      tags: tips,
      notes: JSON.stringify({ caption, transcript, status: 'reviewed' }),
      status: 'saved',
    }),
  });
  if (!res.ok) throw new Error(`Supabase devolvió ${res.status}: ${await res.text()}`);
  const [row] = await res.json();
  return row;
}

async function analyze(url) {
  if (!GROQ_API_KEY) throw new Error('Falta GROQ_API_KEY en el servidor');
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Falta SUPABASE_URL/SUPABASE_ANON_KEY en el servidor');

  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-analysis-'));
  try {
    const { videoPath, title, caption } = await downloadVideo(url, workdir);
    const audioPath = await extractAudio(videoPath, workdir);
    const transcript = await transcribeAudio(audioPath);
    const extracted = await extractTips({ title, caption, transcript });
    const platform = detectPlatform(url);
    const row = await saveToSupabase({ url, platform, ...extracted, caption, transcript });
    return { title: extracted.title, cityId: extracted.cityId, tips: extracted.tips, platform, row };
  } finally {
    await fs.rm(workdir, { recursive: true, force: true }).catch(() => {});
  }
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer((req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === 'POST' && req.url === '/analyze') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      let url;
      try {
        ({ url } = JSON.parse(body));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON inválido' }));
        return;
      }
      if (typeof url !== 'string' || !/^https?:\/\//.test(url)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Falta una URL http(s) válida' }));
        return;
      }
      try {
        const result = await analyze(url);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('Error analizando vídeo:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Error desconocido' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de análisis de vídeos escuchando en el puerto ${PORT}`);
});
