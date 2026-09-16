const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory cache to prevent upstream rate-limits
const cache = new Map();
const CACHE_TTL_MS = 3000;

function parseDevalue(raw) {
  const memo = new Map();

  function resolve(idx) {
    if (typeof idx !== 'number' || idx < 0 || idx >= raw.length) {
      return idx === -5 ? null : idx;
    }
    if (memo.has(idx)) {
      return memo.get(idx);
    }
    const val = raw[idx];
    if (val === null || typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number') {
      memo.set(idx, val);
      return val;
    }
    if (Array.isArray(val)) {
      const arr = [];
      memo.set(idx, arr);
      for (const item of val) {
        arr.push(resolve(item));
      }
      return arr;
    }
    if (typeof val === 'object') {
      const obj = {};
      memo.set(idx, obj);
      for (const [k, v] of Object.entries(val)) {
        let keyName = k;
        if (k.startsWith('_')) {
          const keyIdx = parseInt(k.substring(1), 10);
          if (keyIdx >= 0 && keyIdx < raw.length && typeof raw[keyIdx] === 'string') {
            keyName = raw[keyIdx];
          }
        }
        obj[keyName] = resolve(v);
      }
      return obj;
    }
    return val;
  }

  // Look for the dictionary node that contains 'playing' or 'items'
  for (let i = 0; i < raw.length; i++) {
    if (typeof raw[i] === 'object' && raw[i] !== null && !Array.isArray(raw[i])) {
      const resolved = resolve(i);
      if (resolved && typeof resolved === 'object' && ('playing' in resolved || 'items' in resolved)) {
        return resolved;
      }
    }
  }

  return resolve(8) || {};
}

function extractSongInfo(item) {
  if (!item) return null;
  if (item.song && item.song.title) {
    return {
      title: item.song.title,
      artist: item.song.artist || ''
    };
  }
  if (item.nonlistTitle) {
    return {
      title: item.nonlistTitle,
      artist: item.nonlistArtist || ''
    };
  }
  return null;
}

app.get('/api/queue', async (req, res) => {
  const streamer = req.query.streamer || 'ssofikooooo';
  const now = Date.now();
  const cached = cache.get(streamer);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const url = `https://www.streamersonglist.com/t/${encodeURIComponent(streamer)}/queue.data`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`Upstream returned status ${response.status}`);
    }

    const rawData = await response.json();
    const parsed = parseDevalue(rawData);

    const playing = extractSongInfo(parsed.playing);
    const queueItems = Array.isArray(parsed.items) ? parsed.items : [];
    const next = queueItems.length > 0 ? extractSongInfo(queueItems[0]) : null;

    const result = {
      ok: true,
      streamer,
      playing: playing || null,
      next: next || null,
      queueLength: queueItems.length,
      updatedAt: new Date().toISOString()
    };

    cache.set(streamer, { timestamp: now, data: result });
    return res.json(result);
  } catch (error) {
    console.error(`Error fetching queue for ${streamer}:`, error.message);
    
    if (cached) {
      return res.json(cached.data);
    }

    return res.status(500).json({
      ok: false,
      streamer,
      error: error.message,
      playing: null,
      next: null,
      queueLength: 0
    });
  }
});

app.listen(PORT, () => {
  console.log(`StreamerSonglist OBS Overlay Server running on port ${PORT}`);
  console.log(`Widget URL: http://localhost:${PORT}`);
  console.log(`API URL:    http://localhost:${PORT}/api/queue`);
});
