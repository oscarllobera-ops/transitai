const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post('/api/predict', (req, res) => {
  const { input } = req.body || {};
  if (!input) return res.status(400).json({ error: 'Missing `input` in request body' });
  const transformed = String(input).split('').reverse().join('');
  res.json({ original: input, transformed, length: input.length, ts: new Date().toISOString() });
});

// Deploy as 1st Gen Cloud Function
exports.api = functions.https.onRequest(app);
