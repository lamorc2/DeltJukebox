const express = require("express");
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── DJ password ──────────────────────────────────────────────
const DJ_PASSWORD = 'delt2025'; // change this to whatever you want
// ─────────────────────────────────────────────────────────────

// In-memory song queue
let queue = [];
let nextId = 1;

// Serve pages
app.get("/dj", function (req, res) {
  res.sendFile(path.join(__dirname, 'dj.html'));
});
app.get("/request", function (req, res) {
  res.sendFile(path.join(__dirname, 'user.html'));
});

// --- Auth ---
app.post("/api/auth", function (req, res) {
  const { password } = req.body;
  if (password === DJ_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Wrong password' });
  }
});

// --- Queue API ---

// GET current queue
app.get("/api/queue", function (req, res) {
  res.json(queue);
});

// POST a new song request
app.post("/api/queue", function (req, res) {
  const { song, requester } = req.body;
  if (!song || song.trim() === '') {
    return res.status(400).json({ error: 'Song name is required' });
  }
  const entry = {
    id: nextId++,
    song: song.trim(),
    requester: (requester || '').trim() || 'Anonymous',
    timestamp: new Date().toISOString()
  };
  queue.push(entry);
  res.status(201).json(entry);
});

// DELETE a song by id (DJ removes it)
app.delete("/api/queue/:id", function (req, res) {
  const id = parseInt(req.params.id);
  const index = queue.findIndex(entry => entry.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Song not found' });
  }
  queue.splice(index, 1);
  res.json({ success: true });
});

app.listen(PORT, function () {
  console.log("Server listening on http://localhost:" + PORT);
});
