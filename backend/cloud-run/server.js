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
let runtimeTokenCache = { token: '', expiresAt: 0 };
let recentCache = { data: [], expiresAt: 0 };
const insideRootCache = new Map();
const translationCache = new Map();
const fileMetaCache = new Map();
const thumbnailLogAt = new Map();
const FILE_META_TTL_MS = 30 * 60 * 1000;
const THUMB_LOG_INTERVAL_MS = 5 * 60 * 1000;
const THUMB_LOG_MAX_KEYS = 600;
const KNOWN_LAO_FOLDER_NAMES = new Map([
  ['결혼사진', 'ຮູບແຕ່ງງານ'],
  ['아내 졸업사진', 'ຮູບຈົບການສຶກສາຂອງພັນລະຍາ']
]);

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

app.use((req, res, next) => {
  const origin = String(req.headers.origin || '');
  const allowed = !origin || ALLOWED_ORIGINS.includes(origin);
  if (allowed && origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Album-Key, X-Album-Request-Id, Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Content-Range, X-File-Name, X-Album-Thumb-State, Retry-After');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!allowed) return res.status(403).json({ ok: false, error: 'origin_not_allowed' });
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'memory-album-api', version: '0.5.9' }));

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
    const rows = data.files || [];
    const now = Date.now();
    for (const folder of rows) {
      if (folder?.id) insideRootCache.set(String(folder.id), { value: true, at: now });
    }
    const folders = await localizeFolders(rows, req.query.lang);
    res.json({ ok: true, folders });
  } catch (e) { next(e); }
});

app.get('/api/folder', async (req, res, next) => {
  try {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'folder_id_required' });
    await assertFolderInsideRoot(id);

    const folderMeta = await getMeta(id, 'id,name,mimeType,parents,createdTime,modifiedTime');
    const all = await driveListAll({
      q: `'${escapeQuery(id)}' in parents and trashed = false`,
      orderBy: 'modifiedTime desc',
      pageSize: '1000',
      fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,thumbnailLink,imageMediaMetadata(width,height,time))'
    }, 5000);

    const folderRows = all.filter(x => x.mimeType === 'application/vnd.google-apps.folder');
    const mediaRows = all.filter(x => String(x.mimeType || '').startsWith('image/'));
    const now = Date.now();

    for (const folder of folderRows) {
      if (folder?.id) insideRootCache.set(String(folder.id), { value: true, at: now });
    }
    for (const item of mediaRows) {
      if (!item?.id) continue;
      const fileId = String(item.id);
      insideRootCache.set(fileId, { value: true, at: now });
      fileMetaCache.set(fileId, { value: item, at: now });
    }

    const media = mediaRows.map(x => ({
      id: x.id,
      name: x.name,
      mimeType: x.mimeType,
      size: x.size || '',
      createdTime: x.createdTime || '',
      modifiedTime: x.modifiedTime || '',
      imageTime: x.imageMediaMetadata?.time || '',
      width: x.imageMediaMetadata?.width || null,
      height: x.imageMediaMetadata?.height || null,
      thumbVersion: x.modifiedTime || x.createdTime || ''
    }));

    const localizedFolder = (await localizeFolders([folderMeta], req.query.lang))[0];
    const folders = await localizeFolders(folderRows, req.query.lang);

    res.json({
      ok: true,
      folder: localizedFolder,
      folders,
      media,
      nextPageToken: null
    });
  } catch (e) { next(e); }
});


app.get('/api/recent', async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit || 120)));
    const media = await listRecentMedia(limit);
    res.json({ ok: true, media });
  } catch (e) { next(e); }
});


app.get('/api/trash', async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(300, Number(req.query.limit || 200)));
    const items = await listAlbumTrash(limit);
    res.json({ ok: true, items });
  } catch (e) { next(e); }
});

app.post('/api/trash/restore', async (req, res, next) => {
  try {
    const id = String(req.body?.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'file_id_required' });
    insideRootCache.delete(id);
    await assertInsideRoot(id);
    const meta = await getMeta(id, 'id,name,mimeType,parents,trashed,modifiedTime');
    const isFolder = meta.mimeType === 'application/vnd.google-apps.folder';
    const isImage = String(meta.mimeType || '').startsWith('image/');
    if (!isFolder && !isImage) return res.status(415).json({ ok: false, error: 'unsupported_trash_item' });
    if (!meta.trashed) return res.json({ ok: true, item: meta, alreadyRestored: true });

    const restored = await driveJsonRequest(`files/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      params: { fields: 'id,name,mimeType,parents,trashed,modifiedTime' },
      body: { trashed: false }
    });

    insideRootCache.clear();
    fileMetaCache.clear();
    recentCache = { data: [], expiresAt: 0 };
    res.json({ ok: true, item: restored });
  } catch (e) { next(e); }
});

app.post('/api/folders', async (req, res, next) => {
  try {
    const parentId = String(req.body?.parentId || ROOT_ID);
    const name = normalizeFolderName(req.body?.name);
    const requestId = albumRequestId(req);
    if (!name) return res.status(400).json({ ok: false, error: 'folder_name_required' });
    if (parentId !== ROOT_ID) await assertFolderInsideRoot(parentId);

    if (requestId) {
      const replay = await driveList({
        q: `'${escapeQuery(parentId)}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder' and appProperties has { key='memoryAlbumRequestId' and value='${escapeQuery(requestId)}' }`,
        pageSize: '1',
        fields: 'files(id,name,mimeType,createdTime,modifiedTime,parents)'
      });
      const replayed = (replay.files || [])[0];
      if (replayed) {
        insideRootCache.set(String(replayed.id), { value: true, at: Date.now() });
        const localized = (await localizeFolders([replayed], req.query.lang))[0] || replayed;
        return res.json({ ok: true, folder: localized, replayed: true });
      }
    }

    const existing = await driveList({
      q: `'${escapeQuery(parentId)}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder' and name = '${escapeQuery(name)}'`,
      pageSize: '1',
      fields: 'files(id)'
    });
    if ((existing.files || []).length) return res.status(409).json({ ok: false, error: 'folder_name_exists' });

    const created = await driveJsonRequest('files', {
      method: 'POST',
      params: { fields: 'id,name,mimeType,createdTime,modifiedTime,parents' },
      body: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId], ...(requestId ? { appProperties: { memoryAlbumRequestId: requestId } } : {}) }
    });
    insideRootCache.set(String(created.id), { value: true, at: Date.now() });
    const canonical = requestId ? (await canonicalRequestArtifact(parentId, requestId) || created) : created;
    insideRootCache.set(String(canonical.id), { value: true, at: Date.now() });
    const localized = (await localizeFolders([canonical], req.query.lang))[0] || canonical;
    res.status(String(canonical.id) === String(created.id) ? 201 : 200).json({
      ok: true,
      folder: localized,
      replayed: String(canonical.id) !== String(created.id)
    });
  } catch (e) { next(e); }
});


app.post('/api/folder/rename', async (req, res, next) => {
  try {
    const id = String(req.body?.id || '');
    const name = normalizeFolderName(req.body?.name);
    if (!id) return res.status(400).json({ ok: false, error: 'folder_id_required' });
    if (!name) return res.status(400).json({ ok: false, error: 'folder_name_required' });
    if (id === ROOT_ID) return res.status(403).json({ ok: false, error: 'root_folder_rename_forbidden' });

    await assertFolderInsideRoot(id);
    const current = await getMeta(id, 'id,name,mimeType,parents,createdTime,modifiedTime');
    if (current.mimeType !== 'application/vnd.google-apps.folder') {
      return res.status(400).json({ ok: false, error: 'not_folder' });
    }

    if (String(current.name || '') === name) {
      const localized = (await localizeFolders([current], req.query.lang))[0] || current;
      return res.json({ ok: true, folder: localized, unchanged: true });
    }

    const parentId = String(current.parents?.[0] || ROOT_ID);
    const existing = await driveList({
      q: `'${escapeQuery(parentId)}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder' and name = '${escapeQuery(name)}'`,
      pageSize: '10',
      fields: 'files(id)'
    });
    if ((existing.files || []).some(x => String(x.id) !== id)) {
      return res.status(409).json({ ok: false, error: 'folder_name_exists' });
    }

    const updated = await driveJsonRequest(`files/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      params: { fields: 'id,name,mimeType,parents,createdTime,modifiedTime' },
      body: { name }
    });

    fileMetaCache.delete(id);
    for (const key of [...translationCache.keys()]) {
      if (String(key).startsWith(id + '\n')) translationCache.delete(key);
    }
    insideRootCache.set(id, { value: true, at: Date.now() });

    const localized = (await localizeFolders([updated], req.query.lang))[0] || updated;
    res.json({ ok: true, folder: localized });
  } catch (e) { next(e); }
});

app.post('/api/folder/delete', async (req, res, next) => {
  try {
    const id = String(req.body?.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'folder_id_required' });
    if (id === ROOT_ID) return res.status(403).json({ ok: false, error: 'root_folder_delete_forbidden' });
    await assertFolderInsideRoot(id);
    await driveJsonRequest(`files/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      params: { fields: 'id,trashed' },
      body: { trashed: true }
    });
    insideRootCache.clear();
    fileMetaCache.clear();
    recentCache = { data: [], expiresAt: 0 };
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.post('/api/media/delete', async (req, res, next) => {
  try {
    const id = String(req.body?.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'file_id_required' });
    await getVerifiedImageMeta(id, 'id,name,mimeType,parents');
    await driveJsonRequest(`files/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      params: { fields: 'id,trashed' },
      body: { trashed: true }
    });
    insideRootCache.delete(id);
    fileMetaCache.delete(id);
    recentCache.expiresAt = 0;
    res.json({ ok: true });
  } catch (e) { next(e); }
});

function logThumbnailEvent(level, event, data = {}, key = '') {
  const now = Date.now();
  const throttleKey = String(key || event || 'thumb');
  const last = Number(thumbnailLogAt.get(throttleKey) || 0);
  if (now - last < THUMB_LOG_INTERVAL_MS) return false;
  thumbnailLogAt.set(throttleKey, now);
  if (thumbnailLogAt.size > THUMB_LOG_MAX_KEYS) {
    const oldest = [...thumbnailLogAt.entries()].sort((a, b) => a[1] - b[1]).slice(0, Math.ceil(THUMB_LOG_MAX_KEYS / 4));
    for (const [oldKey] of oldest) thumbnailLogAt.delete(oldKey);
  }
  const fn = typeof console[level] === 'function' ? console[level] : console.log;
  fn.call(console, event, JSON.stringify(data));
  return true;
}

function isThumbnailTransientStatus(status) {
  const n = Number(status || 0);
  return n === 403 || n === 404 || n === 408 || n === 409 || n === 425 || n === 429 || n >= 500;
}

function thumbnailNotReady(res, id, reason, upstreamStatus = 0) {
  const safeReason = String(reason || 'pending').replace(/[^a-z0-9_-]/gi, '').slice(0, 48) || 'pending';
  const status = Number(upstreamStatus || 0);
  logThumbnailEvent('warn', '[thumb-pending]', { id: String(id || ''), reason: safeReason, upstreamStatus: status || null }, `pending:${String(id || '')}:${safeReason}`);
  res.setHeader('Retry-After', '2');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Album-Thumb-State', safeReason);
  return res.status(425).json({
    ok: false,
    error: 'thumbnail_not_ready',
    reason: safeReason,
    ...(status ? { upstreamStatus: status } : {})
  });
}

function sizedThumbnailUrl(link, size) {
  return String(link || '').replace(/=s\d+(?:-c)?$/, `=s${size}`);
}

app.get('/api/thumb', async (req, res, next) => {
  try {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'file_id_required' });
    const fields = 'id,name,mimeType,parents,size,modifiedTime,thumbnailLink';
    let meta = await getVerifiedImageMeta(id, fields);

    // Newly uploaded Drive images may not have thumbnailLink yet. Refresh metadata once
    // instead of falling back to the full original, which can be tens of MB per grid tile.
    if (!meta.thumbnailLink) {
      const fresh = await getMeta(id, fields);
      if (!String(fresh?.mimeType || '').startsWith('image/')) {
        return res.status(415).json({ ok: false, error: 'not_image' });
      }
      meta = rememberFileMeta(fresh);
    }
    if (!meta.thumbnailLink) {
      return thumbnailNotReady(res, id, 'link_missing');
    }

    const token = await getGoogleToken();
    let firstError = null;
    try {
      const upstream = await fetchGoogle(sizedThumbnailUrl(meta.thumbnailLink, 640), {
        headers: { Authorization: `Bearer ${token}` }
      });
      res.setHeader('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
      return pipeGoogleResponse(upstream, res, meta.name, false);
    } catch (e) {
      firstError = e;
    }

    // thumbnailLink can be created but temporarily stale/unavailable. Force one fresh
    // Drive metadata read and retry once before asking the browser to back off.
    const firstStatus = Number(firstError?.status || 0);
    if (!isThumbnailTransientStatus(firstStatus)) throw firstError;

    let fresh = null;
    try {
      fresh = await getMeta(id, fields);
      if (String(fresh?.mimeType || '').startsWith('image/')) {
        meta = rememberFileMeta(fresh);
      }
    } catch (metaError) {
      logThumbnailEvent('warn', '[thumb-refresh-failed]', {
        id,
        upstreamStatus: firstStatus || null,
        metadataStatus: Number(metaError?.status || 0) || null
      }, `refresh:${id}`);
    }

    if (!meta.thumbnailLink) {
      return thumbnailNotReady(res, id, 'link_missing_after_refresh', firstStatus);
    }

    try {
      const retryToken = await getGoogleToken();
      const upstream = await fetchGoogle(sizedThumbnailUrl(meta.thumbnailLink, 640), {
        headers: { Authorization: `Bearer ${retryToken}` }
      });
      logThumbnailEvent('info', '[thumb-recovered]', { id, firstStatus: firstStatus || null }, `recovered:${id}`);
      res.setHeader('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
      return pipeGoogleResponse(upstream, res, meta.name, false);
    } catch (retryError) {
      const retryStatus = Number(retryError?.status || firstStatus || 0);
      if (isThumbnailTransientStatus(retryStatus)) {
        return thumbnailNotReady(res, id, `upstream_${retryStatus || 'error'}`, retryStatus);
      }
      throw retryError;
    }
  } catch (e) { next(e); }
});

app.get('/api/preview', async (req, res, next) => {
  try {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'file_id_required' });
    const fields = 'id,name,mimeType,parents,size,modifiedTime,thumbnailLink';
    let meta = await getVerifiedImageMeta(id, fields);

    // Preview must never fall back to the full original. The viewer starts /api/media
    // separately, so using alt=media here could download the same multi-MB file twice.
    if (!meta.thumbnailLink) {
      const fresh = await getMeta(id, fields);
      if (String(fresh?.mimeType || '').startsWith('image/')) meta = rememberFileMeta(fresh);
    }
    if (!meta.thumbnailLink) return thumbnailNotReady(res, id, 'preview_link_missing');

    const token = await getGoogleToken();
    let firstError = null;
    try {
      const upstream = await fetchGoogle(sizedThumbnailUrl(meta.thumbnailLink, 2048), {
        headers: { Authorization: `Bearer ${token}` }
      });
      res.setHeader('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
      return pipeGoogleResponse(upstream, res, meta.name, false);
    } catch (e) {
      firstError = e;
    }

    const firstStatus = Number(firstError?.status || 0);
    if (!isThumbnailTransientStatus(firstStatus)) throw firstError;

    try {
      const fresh = await getMeta(id, fields);
      if (String(fresh?.mimeType || '').startsWith('image/')) meta = rememberFileMeta(fresh);
    } catch (metaError) {
      logThumbnailEvent('warn', '[preview-refresh-failed]', {
        id,
        upstreamStatus: firstStatus || null,
        metadataStatus: Number(metaError?.status || 0) || null
      }, `preview-refresh:${id}`);
    }

    if (!meta.thumbnailLink) return thumbnailNotReady(res, id, 'preview_link_missing_after_refresh', firstStatus);

    try {
      const retryToken = await getGoogleToken();
      const upstream = await fetchGoogle(sizedThumbnailUrl(meta.thumbnailLink, 2048), {
        headers: { Authorization: `Bearer ${retryToken}` }
      });
      res.setHeader('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
      return pipeGoogleResponse(upstream, res, meta.name, false);
    } catch (retryError) {
      const retryStatus = Number(retryError?.status || firstStatus || 0);
      if (isThumbnailTransientStatus(retryStatus)) {
        return thumbnailNotReady(res, id, `preview_upstream_${retryStatus || 'error'}`, retryStatus);
      }
      throw retryError;
    }
  } catch (e) { next(e); }
});

app.get('/api/media', async (req, res, next) => {
  try {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'file_id_required' });
    const meta = await getVerifiedImageMeta(id, 'id,name,mimeType,parents,size,modifiedTime');
    const token = await getGoogleToken();
    const headers = { Authorization: `Bearer ${token}` };
    if (req.headers.range) headers.Range = String(req.headers.range);
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`;
    const upstream = await fetchGoogle(url, { headers });
    res.setHeader('Cache-Control', 'private, max-age=3600');
    pipeGoogleResponse(upstream, res, meta.name, false);
  } catch (e) { next(e); }
});

app.post('/api/upload', upload.single('file'), async (req, res, next) => {
  try {
    const folderId = String(req.query.folder || '');
    const requestId = albumRequestId(req);
    if (!folderId) return res.status(400).json({ ok: false, error: 'folder_id_required' });
    if (!req.file) return res.status(400).json({ ok: false, error: 'file_required' });
    await assertFolderInsideRoot(folderId);

    const mime = String(req.file.mimetype || 'application/octet-stream');
    if (!mime.startsWith('image/')) return res.status(415).json({ ok: false, error: 'image_only' });

    if (requestId) {
      const replay = await driveList({
        q: `'${escapeQuery(folderId)}' in parents and trashed = false and appProperties has { key='memoryAlbumRequestId' and value='${escapeQuery(requestId)}' }`,
        pageSize: '1',
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,parents)'
      });
      const replayed = (replay.files || [])[0];
      if (replayed) {
        insideRootCache.set(String(replayed.id), { value: true, at: Date.now() });
        return res.json({ ok: true, file: replayed, replayed: true });
      }
    }

    const safeName = await uniqueName(folderId, normalizeUploadName(req.file.originalname || 'photo'));
    const token = await getGoogleToken();

    const fd = new FormData();
    const metadata = { name: safeName, parents: [folderId], ...(requestId ? { appProperties: { memoryAlbumRequestId: requestId } } : {}) };
    fd.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' }));
    fd.append('file', new Blob([req.file.buffer], { type: mime }), safeName);

    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,parents';
    const upstream = await fetchGoogle(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const created = await upstream.json();
    insideRootCache.set(created.id, { value: true, at: Date.now() });
    const canonical = requestId ? (await canonicalRequestArtifact(folderId, requestId) || created) : created;
    insideRootCache.set(String(canonical.id), { value: true, at: Date.now() });
    recentCache = { data: [], expiresAt: 0 };
    res.status(String(canonical.id) === String(created.id) ? 201 : 200).json({
      ok: true,
      file: canonical,
      replayed: String(canonical.id) !== String(created.id)
    });
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
  let firstErrorBody = '';
  if (!res.ok) firstErrorBody = await res.clone().text().catch(() => '');

  const scopeError =
    res.status === 403 &&
    /insufficient authentication scopes|insufficient permission/i.test(firstErrorBody);

  if ((res.status === 401 || scopeError) && retry) {
    tokenCache = { token: '', expiresAt: 0 };
    const token = await getGoogleToken(true);
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    res = await fetch(url, { ...init, headers });
  }
  if (!res.ok) {
    const body = await res.text().catch(() => firstErrorBody);
    const error = new Error(`google_${res.status}: ${body.slice(0, 300)}`);
    error.status = res.status >= 500 ? 502 : res.status;
    throw error;
  }
  return res;
}

async function driveJsonRequest(path, { method = 'GET', params = {}, body = null } = {}) {
  const token = await getGoogleToken();
  const url = new URL(`https://www.googleapis.com/drive/v3/${path.replace(/^\/+/, '')}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  const headers = { Authorization: `Bearer ${token}` };
  const init = { method, headers };
  if (body !== null) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetchGoogle(url, init);
  if (res.status === 204) return {};
  return res.json();
}

async function driveJson(path, params = {}) {
  return driveJsonRequest(path, { params });
}

function driveList(params) {
  return driveJson('files', { spaces: 'drive', ...params });
}

function getMeta(id, fields = 'id,name,mimeType,parents') {
  return driveJson(`files/${encodeURIComponent(id)}`, { fields, supportsAllDrives: 'true' });
}

function getCachedFileMeta(id) {
  const cached = fileMetaCache.get(String(id || ''));
  if (!cached || Date.now() - cached.at >= FILE_META_TTL_MS) return null;
  return cached.value || null;
}

function rememberFileMeta(meta) {
  if (meta?.id) fileMetaCache.set(String(meta.id), { value: meta, at: Date.now() });
  return meta;
}

async function getVerifiedImageMeta(id, fields) {
  const cached = getCachedFileMeta(id);
  if (cached && String(cached.mimeType || '').startsWith('image/')) return cached;

  await assertInsideRoot(id);
  const meta = rememberFileMeta(await getMeta(id, fields));
  if (!String(meta?.mimeType || '').startsWith('image/')) {
    throw Object.assign(new Error('not_image'), { status: 415 });
  }
  return meta;
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


async function driveListAll(params, maxItems = 5000) {
  const out = [];
  let pageToken = '';
  do {
    const data = await driveList({ ...params, pageToken });
    out.push(...(data.files || []));
    pageToken = String(data.nextPageToken || '');
  } while (pageToken && out.length < maxItems);
  return out.slice(0, maxItems);
}

async function listRecentMedia(limit) {
  if (recentCache.expiresAt > Date.now()) {
    return recentCache.data.slice(0, limit);
  }

  const queue = [ROOT_ID];
  const seen = new Set();
  const media = [];
  let scannedFolders = 0;

  while (queue.length && scannedFolders < 250) {
    const parentId = queue.shift();
    if (!parentId || seen.has(parentId)) continue;
    seen.add(parentId);
    scannedFolders++;

    const rows = await driveListAll({
      q: `'${escapeQuery(parentId)}' in parents and trashed = false`,
      orderBy: 'modifiedTime desc',
      pageSize: '1000',
      fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,thumbnailLink,imageMediaMetadata(width,height,time))'
    });

    const now = Date.now();
    for (const item of rows) {
      if (!item?.id) continue;
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        insideRootCache.set(String(item.id), { value: true, at: now });
        queue.push(String(item.id));
        continue;
      }
      if (!String(item.mimeType || '').startsWith('image/')) continue;
      const fileId = String(item.id);
      insideRootCache.set(fileId, { value: true, at: now });
      fileMetaCache.set(fileId, { value: item, at: now });
      media.push({
        id: item.id,
        name: item.name,
        mimeType: item.mimeType,
        size: item.size || '',
        createdTime: item.createdTime || '',
        modifiedTime: item.modifiedTime || '',
        imageTime: item.imageMediaMetadata?.time || '',
        width: item.imageMediaMetadata?.width || null,
        height: item.imageMediaMetadata?.height || null,
        thumbVersion: item.modifiedTime || item.createdTime || ''
      });
    }
  }

  media.sort((a, b) => {
    const ad = Date.parse(a.createdTime || a.modifiedTime || 0) || 0;
    const bd = Date.parse(b.createdTime || b.modifiedTime || 0) || 0;
    return bd - ad;
  });
  recentCache = { data: media.slice(0, 200), expiresAt: Date.now() + 30000 };
  return recentCache.data.slice(0, limit);
}

async function listAlbumTrash(limit = 200) {
  const queue = [ROOT_ID];
  const seen = new Set();
  const out = [];
  let scannedFolders = 0;

  while (queue.length && out.length < limit && scannedFolders < 250) {
    const parentId = queue.shift();
    if (!parentId || seen.has(parentId)) continue;
    seen.add(parentId);
    scannedFolders++;

    const rows = await driveListAll({
      q: `'${escapeQuery(parentId)}' in parents`,
      orderBy: 'modifiedTime desc',
      pageSize: '1000',
      fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,trashed,trashedTime,thumbnailLink)'
    }, 2000);

    for (const item of rows) {
      if (!item?.id) continue;
      const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
      const isImage = String(item.mimeType || '').startsWith('image/');
      if (item.trashed) {
        if (isFolder || isImage) {
          out.push({
            id: item.id,
            name: item.name,
            mimeType: item.mimeType,
            size: item.size || '',
            createdTime: item.createdTime || '',
            modifiedTime: item.modifiedTime || '',
            trashedTime: item.trashedTime || '',
            parents: item.parents || []
          });
          if (out.length >= limit) break;
        }
        continue;
      }
      if (isFolder) queue.push(String(item.id));
    }
  }

  out.sort((a,b)=>{
    const ad=Date.parse(a.trashedTime||a.modifiedTime||0)||0;
    const bd=Date.parse(b.trashedTime||b.modifiedTime||0)||0;
    return bd-ad;
  });
  return out.slice(0,limit);
}

function normalizeFolderName(name) {
  return String(name || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 100);
}

function albumRequestId(req) {
  return String(req?.headers?.['x-album-request-id'] || '').trim().replace(/[^A-Za-z0-9._:-]/g, '').slice(0, 96);
}

async function canonicalRequestArtifact(parentId, requestId) {
  if (!parentId || !requestId) return null;
  const data = await driveList({
    q: `'${escapeQuery(parentId)}' in parents and trashed = false and appProperties has { key='memoryAlbumRequestId' and value='${escapeQuery(requestId)}' }`,
    pageSize: '20',
    fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,parents)'
  });
  const rows = [...(data.files || [])].sort((a, b) => {
    const at = Date.parse(a.createdTime || 0) || 0;
    const bt = Date.parse(b.createdTime || 0) || 0;
    return at - bt || String(a.id || '').localeCompare(String(b.id || ''));
  });
  const keep = rows[0] || null;
  for (const duplicate of rows.slice(1)) {
    try {
      await driveJsonRequest(`files/${encodeURIComponent(duplicate.id)}`, {
        method: 'PATCH',
        params: { fields: 'id,trashed' },
        body: { trashed: true }
      });
      insideRootCache.delete(String(duplicate.id));
      fileMetaCache.delete(String(duplicate.id));
    } catch (e) {
      console.warn('[idempotency-cleanup]', duplicate.id, e?.message || e);
    }
  }
  return keep;
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
    const known = KNOWN_LAO_FOLDER_NAMES.get(String(row.name || '').trim());
    if (known) {
      row.displayName = known;
      translationCache.set(key, known);
    } else if (translationCache.has(key)) {
      row.displayName = translationCache.get(key);
    } else {
      needs.push(row);
    }
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
  if (!rows.length) return out;

  try {
    const token = await getRuntimeAccessToken();
    const res = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: rows.map(x => String(x.name || '')),
        source: 'ko',
        target: 'lo',
        format: 'text'
      })
    });
    if (res.ok) {
      const data = await res.json();
      const translations = Array.isArray(data?.data?.translations) ? data.data.translations : [];
      rows.forEach((row, i) => {
        const lao = decodeTranslationText(translations[i]?.translatedText || '');
        if (lao) out.set(String(row.id || ''), lao);
      });
      if (out.size) return out;
    } else {
      const body = await res.text().catch(() => '');
      console.warn('[folder-translation-cloud]', res.status, body.slice(0, 240));
    }
  } catch (e) {
    console.warn('[folder-translation-cloud]', e?.message || e);
  }

  const apiKey = String(process.env.GEMINI_API_KEY || '');
  if (!apiKey) return out;
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
    console.warn('[folder-translation-gemini]', e?.message || e);
  }
  return out;
}

async function getRuntimeAccessToken(force = false) {
  if (!force && runtimeTokenCache.token && Date.now() < runtimeTokenCache.expiresAt - 60000) {
    return runtimeTokenCache.token;
  }
  const res = await fetch(
    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
    { headers: { 'Metadata-Flavor': 'Google' } }
  );
  if (!res.ok) throw new Error(`runtime_token_${res.status}`);
  const data = await res.json();
  if (!data?.access_token) throw new Error('runtime_token_invalid');
  runtimeTokenCache = {
    token: String(data.access_token),
    expiresAt: Date.now() + Math.max(300, Number(data.expires_in || 3000)) * 1000
  };
  return runtimeTokenCache.token;
}

function decodeTranslationText(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
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
