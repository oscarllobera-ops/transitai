const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/api/status', (req, res) => {
  res.json({ 
    ok: true, 
    time: new Date().toISOString(),
    version: 'transitai-1.0'
  });
});

// Minimal predict endpoint
app.post('/api/predict', (req, res) => {
  try {
    const { input } = req.body || {};
    if (!input) {
      return res.status(400).json({ error: 'Missing input field' });
    }

    const transformed = String(input).split('').reverse().join('');
    res.json({ 
      original: input, 
      transformed, 
      length: input.length, 
      ts: new Date().toISOString() 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export as Cloud Function
exports.api = functions.https.onRequest(app);
