# TransitAI – Minimal Vite + Express demo

Stappen om lokaal te draaien:

1. Install dependencies

```bash
npm install
```

2. Start development (start zowel backend als Vite dev server):

```bash
npm run dev
```

- Vite dev server draait op `http://localhost:5173`.
- Express backend draait op `http://localhost:3000` en biedt `POST /api/predict` en `GET /api/status`.

Voor productie: bouw de frontend met `npm run build` en serveer de build map met je favoriete server of integreer in de Express server.
