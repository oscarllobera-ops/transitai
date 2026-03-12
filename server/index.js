const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Example POST route that accepts JSON { input: string }
app.post('/api/predict', (req, res) => {
  const { input } = req.body || {};
  if (!input) return res.status(400).json({ error: 'Missing `input` in request body' });

  // Dummy processing: reverse string and return metadata
  const transformed = String(input).split('').reverse().join('');
  res.json({ original: input, transformed, length: input.length, ts: new Date().toISOString() });
});

// Serve a static folder if needed (optional)
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
