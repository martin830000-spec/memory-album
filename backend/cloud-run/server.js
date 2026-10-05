import express from 'express';
import multer from 'multer';
import { Readable } from 'node:stream';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 80 * 1024 * 1024, files: 1 }
});

const PORT = Number(process.env.PORT || 8080);
const ROOT_ID = String(process.env.ALBUM_ROOT_FOLDER_ID || '1W0J9IWs_MKtZiLLBxB9NeXTpWzOVvooV');
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || 'https://martin830000-spec.github.io')
  .split(',').map(v => v.trim()).filter(Boolean);

let tokenCache = { token: '', expiresAt: 0 };
const insideRootCache = new Map();
const translationCache = new Map();

app.disable('x-powered-by');

app.use((req, res, next) => {
  const origin = String(req.headers.origin || '');
  const allowed = !origin || ALLOWED_ORIGINS.includes(origin);
  if (allowed && origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Album-Key, Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Content-Range, X-File-Name');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!allowed) return res.status(403).json({ ok: false, error: 'origin_not_allowed' });
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'memory-album-api', version: '0.3.0' }));

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  const expected = String(process.env.ALBUM_ACCESS_KEY || '');
  const supplied = String(req.headers['x-album-key'] || '');
  if (!expected || supplied !== expected) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
});

app.get('/api/folders', async (req, res, next) => {
  try {
    const data = await driveList({
      q: `'${escapeQuery(ROOT_ID)}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
      orderBy: 'name',
      pageSize: '1000',
      fields: 'files(id,name,mimeType,createdTime,modifiedTime,parents)'
    });
    const folders = await localizeFolders(data.files || [], req.query.lang);
    res.json({ ok: true, folders });
  } catch (e) { next(e); }
});

app.get('/api/folder', async (req, res, next) => {
  try {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'folder_id_required' });
    await assertFolderInsideRoot(id);

    const folderMeta = await getMeta(id, 'id,name,mimeType,parents,createdTime,modifiedTime');
    const data = await driveList({
      q: `'${escapeQuery(id)}' in parents and trashed = false`,
      orderBy: 'modifiedTime desc',
      pageSize: '1000',
      fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,imageMediaMetadata(width,height,time))'
    });

    const all = data.files || [];
    const folderRows = all.filter(x => x.mimeType === 'application/vnd.google-apps.folder');
    const media = all.filter(x => String(x.mimeType || '').startsWith('image/')).map(x => ({
      id: x.id,
      name: x.name,
      mimeType: x.mimeType,
      size: x.size || '',
      createdTime: x.createdTime || '',
      modifiedTime: x.modifiedTime || '',
      imageTime: x.imageMediaMetadata?.time || '',
      width: x.imageMediaMetadata?.width || null,
      height: x.imageMediaMetadata?.height || null
    }));

    const localizedFolder = (await localizeFolders([folderMeta], req.query.lang))[0];
    const folders = await localizeFolders(folderRows, req.query.lang);

    res.json({
      ok: true,
      folder: localizedFolder,
      folders,
      media,
      nextPageToken: data.nextPageToken || null
    });
  } catch (e) { next(e); }
});

app.get('/api/thumb', async (req, res, next) => {
  try {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'file_id_required' });
    await assertInsideRoot(id);

    const meta = await getMeta(id, 'id,name,mimeType,parents,thumbnailLink');
    if (!String(meta.mimeType || '').startsWith('image/')) return res.status(415).json({ ok: false, error: 'not_image' });

    const token = await getGoogleToken();
    let url = meta.thumbnailLink || '';
    if (url) url = url.replace(/=s\d+(?:-c)?$/, '=s640');
    if (!url) url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`;

    const upstream = await fetchGoogle(url, { headers: { Authorization: `Bearer ${token}` } });
    res.setHeader('Cache-Control', 'private, max-age=3600');
    pipeGoogleResponse(upstream, res, meta.name, false);
  } catch (e) { next(e); }
});

app.get('/api/media', async (req, res, next) => {
  try {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'file_id_required' });
    await assertInsideRoot(id);

    const meta = await getMeta(id, 'id,name,mimeType,parents,size');
    if (!String(meta.mimeType || '').startsWith('image/')) return res.status(415).json({ ok: false, error: 'not_image' });

    const token = await getGoogleToken();
    const headers = { Authorization: `Bearer ${token}` };
    if (req.headers.range) headers.Range = String(req.headers.range);
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`;
    const upstream = await fetchGoogle(url, { headers });
    res.setHeader('Cache-Control', 'private, max-age=300');
    pipeGoogleResponse(upstream, res, meta.name, false);
  } catch (e) { next(e); }
});

app.post('/api/upload', upload.single('file'), async (req, res, next) => {
  try {
    const folderId = String(req.query.folder || '');
    if (!folderId) return res.status(400).json({ ok: false, error: 'folder_id_required' });
    if (!req.file) return res.status(400).json({ ok: false, error: 'file_required' });
    await assertFolderInsideRoot(folderId);

    const mime = String(req.file.mimetype || 'application/octet-stream');
    if (!mime.startsWith('image/')) return res.status(415).json({ ok: false, error: 'image_only' });

    const safeName = await uniqueName(folderId, normalizeUploadName(req.file.originalname || 'photo'));
    const token = await getGoogleToken();

    const fd = new FormData();
    fd.append('metadata', new Blob([JSON.stringify({ name: safeName, parents: [folderId] })], { type: 'application/json; charset=UTF-8' }));
    fd.append('file', new Blob([req.file.buffer], { type: mime }), safeName);

    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,parents';
    const upstream = await fetchGoogle(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const created = await upstream.json();
    insideRootCache.set(created.id, { value: true, at: Date.now() });
    res.status(201).json({ ok: true, file: created });
  } catch (e) { next(e); }
});

app.use((err, _req, res, _next) => {
  console.error('[memory-album-api]', err);
  if (res.headersSent) return;
  const status = Number(err?.status || err?.statusCode || 500);
  res.status(status >= 400 && status < 600 ? status : 500).json({
    ok: false,
    error: String(err?.code || err?.message || 'server_error').slice(0, 200)
  });
});

app.listen(PORT, () => console.log(`memory-album-api listening on :${PORT}`));

async function getGoogleToken(force = false) {
  if (!force && tokenCache.token && Date.now() < tokenCache.expiresAt - 60000) return tokenCache.token;

  const broker = String(process.env.ALBUM_TOKEN_BROKER_URL || '');
  const key = String(process.env.ALBUM_BROKER_KEY || '');
  if (!broker || !key) throw Object.assign(new Error('token_broker_not_configured'), { status: 503 });

  const url = new URL(broker);
  url.searchParams.set('key', key);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw Object.assign(new Error('token_broker_failed'), { status: 502 });

  const data = await res.json();
  if (!data?.ok || !data?.accessToken) throw Object.assign(new Error('token_broker_invalid_response'), { status: 502 });

  tokenCache = {
    token: String(data.accessToken),
    expiresAt: Date.now() + Math.max(300, Number(data.expiresIn || 3000)) * 1000
  };
  return tokenCache.token;
}

async function fetchGoogle(url, init = {}, retry = true) {
  let res = await fetch(url, init);
  if (res.status === 401 && retry) {
    tokenCache = { token: '', expiresAt: 0 };
    const token = await getGoogleToken(true);
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    res = await fetch(url, { ...init, headers });
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const error = new Error(`google_${res.status}: ${body.slice(0, 300)}`);
    error.status = res.status >= 500 ? 502 : res.status;
    throw error;
  }
  return res;
}

async function driveJson(path, params = {}) {
  const token = await getGoogleToken();
  const url = new URL(`https://www.googleapis.com/drive/v3/${path.replace(/^\/+/, '')}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  const res = await fetchGoogle(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

function driveList(params) {
  return driveJson('files', { spaces: 'drive', ...params });
}

function getMeta(id, fields = 'id,name,mimeType,parents') {
  return driveJson(`files/${encodeURIComponent(id)}`, { fields, supportsAllDrives: 'true' });
}

async function assertFolderInsideRoot(id) {
  await assertInsideRoot(id);
  const meta = await getMeta(id, 'id,mimeType');
  if (meta.mimeType !== 'application/vnd.google-apps.folder') throw Object.assign(new Error('not_folder'), { status: 400 });
}

async function assertInsideRoot(id) {
  if (!id) throw Object.assign(new Error('id_required'), { status: 400 });
  if (id === ROOT_ID) return true;

  const cached = insideRootCache.get(id);
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) {
    if (!cached.value) throw Object.assign(new Error('outside_album_root'), { status: 403 });
    return true;
  }

  const visited = new Set();
  let frontier = [id];
  let depth = 0;
  while (frontier.length && depth++ < 24) {
    const next = [];
    for (const current of frontier) {
      if (current === ROOT_ID) {
        insideRootCache.set(id, { value: true, at: Date.now() });
        return true;
      }
      if (visited.has(current)) continue;
      visited.add(current);
      const meta = await getMeta(current, 'id,parents');
      for (const parent of meta.parents || []) {
        if (parent === ROOT_ID) {
          insideRootCache.set(id, { value: true, at: Date.now() });
          return true;
        }
        next.push(parent);
      }
    }
    frontier = next;
  }

  insideRootCache.set(id, { value: false, at: Date.now() });
  throw Object.assign(new Error('outside_album_root'), { status: 403 });
}

function escapeQuery(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function uniqueName(folderId, originalName) {
  const dot = originalName.lastIndexOf('.');
  const stem = dot > 0 ? originalName.slice(0, dot) : originalName;
  const ext = dot > 0 ? originalName.slice(dot) : '';
  let candidate = originalName;

  for (let i = 1; i <= 999; i++) {
    const data = await driveList({
      q: `'${escapeQuery(folderId)}' in parents and trashed = false and name = '${escapeQuery(candidate)}'`,
      pageSize: '1',
      fields: 'files(id)'
    });
    if (!(data.files || []).length) return candidate;
    candidate = `${stem}_${i + 1}${ext}`;
  }
  return `${stem}_${Date.now()}${ext}`;
}

function normalizeUploadName(name) {
  let value = String(name || 'photo').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (!value) value = 'photo';
  return value.slice(0, 240);
}

async function localizeFolders(rows, lang) {
  const normalized = (rows || []).map(x => ({
    id: x.id,
    name: x.name,
    displayName: x.name,
    mimeType: x.mimeType,
    createdTime: x.createdTime || '',
    modifiedTime: x.modifiedTime || '',
    parents: x.parents || []
  }));
  if (String(lang || '').toLowerCase() !== 'lo') return normalized;

  const needs = [];
  for (const row of normalized) {
    if (!/[\uac00-\ud7a3]/.test(row.name || '')) continue;
    const key = `${row.id}\n${row.name}`;
    if (translationCache.has(key)) row.displayName = translationCache.get(key);
    else needs.push(row);
  }
  if (!needs.length) return normalized;

  const translated = await translateFolderBatch(needs);
  for (const row of needs) {
    const lao = translated.get(row.id);
    if (lao) {
      row.displayName = lao;
      translationCache.set(`${row.id}\n${row.name}`, lao);
    }
  }
  return normalized;
}

async function translateFolderBatch(rows) {
  const out = new Map();
  const apiKey = String(process.env.GEMINI_API_KEY || process.env.ALBUM_ACCESS_KEY || '');
  if (!apiKey || !rows.length) return out;
  const model = String(process.env.GEMINI_MODEL || 'gemini-2.5-flash');

  const payload = rows.map(x => ({ id: x.id, name: x.name }));
  const prompt = [
    'Translate these Google Drive photo-album folder names from Korean into natural, concise Lao.',
    'These are display labels for a wife. Preserve numbers, years, emoji, underscores, and proper nouns when appropriate.',
    'Do not add explanations. Return JSON only as an array of objects with exactly keys "id" and "lao".',
    JSON.stringify(payload)
  ].join('\n');

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' }
      })
    });
    if (!res.ok) return out;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const id = String(item?.id || ''), lao = String(item?.lao || '').trim();
        if (id && lao) out.set(id, lao);
      }
    }
  } catch (e) {
    console.warn('[folder-translation]', e?.message || e);
  }
  return out;
}

function pipeGoogleResponse(upstream, res, name, attachment) {
  res.status(upstream.status);
  for (const key of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']) {
    const value = upstream.headers.get(key);
    if (value) res.setHeader(key, value);
  }
  res.setHeader('X-File-Name', encodeURIComponent(String(name || 'photo')));
  if (attachment) res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(String(name || 'photo'))}`);
  if (!upstream.body) return res.end();
  Readable.fromWeb(upstream.body).pipe(res);
}
