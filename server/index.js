const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Resend
const resend = new Resend('re_EHQHu73P_G9f6h5oZw4knL7yG5Dk8Nb4z');
const COMPANY_EMAIL = 'info@transitai.nl';

// In-memory storage for tickets (in production: use database)
const tickets = {};

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ──────────────────────────────────────────────────────────────
// CONTACT FORM SUBMISSION
// ──────────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ticketId = uuidv4().slice(0, 8).toUpperCase();
    const timestamp = new Date().toISOString();

    // Save ticket
    tickets[ticketId] = {
      type: 'contact',
      ticketId,
      name,
      email,
      phone,
      message,
      timestamp,
      status: 'new'
    };

    // Email to company
    await resend.emails.send({
      from: 'noreply@transitai.nl',
      to: COMPANY_EMAIL,
      subject: `[Ticket: ${ticketId}] Nieuw contactformulier van ${name}`,
      html: `
        <h2>Nieuw contactformulier</h2>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefoon:</strong> ${phone || '(niet opgegeven)'}</p>
        <hr>
        <h3>Bericht:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Ontvangen: ${new Date(timestamp).toLocaleString('nl-NL')}</small></p>
      `
    });

    // Confirmation email to customer
    await resend.emails.send({
      from: 'noreply@transitai.nl',
      to: email,
      subject: `Dank u wel voor uw bericht – Ticket #${ticketId}`,
      html: `
        <h2>Dank u wel!</h2>
        <p>Hallo ${name},</p>
        <p>We hebben uw bericht ontvangen. Onze team zal binnen <strong>24 uur</strong> contact met u opnemen.</p>
        
        <p><strong>Uw ticket nummer:</strong> <code>${ticketId}</code></p>
        
        <h3>Waarom we snel reageren</h3>
        <p>AI-compliance is urgent. De EU AI Act is van kracht, en veel organisaties weten niet exact waar ze staan. 
        Wij helpen u snel duidelijkheid te geven zodat u:</p>
        <ul>
          <li>Uw risico's inziet</li>
          <li>Concrete stappen kunt nemen</li>
          <li>Boetes en schadeclaims voorkomt</li>
        </ul>
        
        <h3>Ons proces</h3>
        <ol>
          <li><strong>Analyse:</strong> We beoordelen uw situatie</li>
          <li><strong>Advies:</strong> We geven juridisch en technisch advies</li>
          <li><strong>Implementatie:</strong> We helpen bij de uitvoering</li>
          <li><strong>Monitoring:</strong> We volgen compliance voortgang</li>
        </ol>
        
        <p>Tot ziens,<br>
        <strong>TransitAI Team</strong></p>
      `
    });

    res.json({ success: true, ticketId, message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to process contact form' });
  }
});

// ──────────────────────────────────────────────────────────────
// OFFERTE REQUEST
// ──────────────────────────────────────────────────────────────
app.post('/api/offerte', async (req, res) => {
  try {
    const { bedrijfsnaam, naam, email, medewerkers, beschrijving } = req.body;
    
    if (!bedrijfsnaam || !naam || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ticketId = uuidv4().slice(0, 8).toUpperCase();
    const timestamp = new Date().toISOString();

    tickets[ticketId] = {
      type: 'offerte',
      ticketId,
      bedrijfsnaam,
      naam,
      email,
      medewerkers,
      beschrijving,
      timestamp,
      status: 'new'
    };

    // Email to company
    await resend.emails.send({
      from: 'noreply@transitai.nl',
      to: COMPANY_EMAIL,
      subject: `[Ticket: ${ticketId}] Offerteaanvraag van ${bedrijfsnaam}`,
      html: `
        <h2>Offerteaanvraag ontvangen</h2>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Bedrijf:</strong> ${bedrijfsnaam}</p>
        <p><strong>Contactpersoon:</strong> ${naam}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Aantal medewerkers:</strong> ${medewerkers || '(niet opgegeven)'}</p>
        <hr>
        <h3>Beschrijving van behoefte:</h3>
        <p>${beschrijving ? beschrijving.replace(/\n/g, '<br>') : '(niet opgegeven)'}</p>
        <hr>
        <p><small>Ontvangen: ${new Date(timestamp).toLocaleString('nl-NL')}</small></p>
      `
    });

    // Confirmation email to customer
    await resend.emails.send({
      from: 'noreply@transitai.nl',
      to: email,
      subject: `Uw offerteaanvraag ontvangen – Ticket #${ticketId}`,
      html: `
        <h2>Dank u wel voor uw interesse!</h2>
        <p>Hallo ${naam},</p>
        <p>We hebben uw offerteaanvraag voor <strong>${bedrijfsnaam}</strong> ontvangen. 
        Een specialist zal binnen <strong>24 uur</strong> contact met u opnemen met een persoonlijke benadering.</p>
        
        <p><strong>Uw ticket nummer:</strong> <code>${ticketId}</code></p>
        
        <h3>Waarom TransitAI?</h3>
        <p>U hebt de juiste keuze gemaakt. De EU AI Act stelt hoge eisen aan organisaties die AI gebruiken. 
        Zonder juiste voorbereiding riskeert u:</p>
        <ul>
          <li>Boetes tot €35 miljoen</li>
          <li>Schadeclaims van klanten</li>
          <li>Reputatieschade</li>
        </ul>
        
        <h3>Ons compliance proces</h3>
        <ol>
          <li><strong>Huidige situatie in kaart:</strong> We beoordelen al uw AI-toepassingen</li>
          <li><strong>Risico's identificeren:</strong> Per toepassing bepalen we de risicocategorie</li>
          <li><strong>Actieplan:</strong> Concrete stappen met prioritering</li>
          <li><strong>Implementatie:</strong> Juridische en technische ondersteuning</li>
          <li><strong>Monitoring:</strong> Voortdurende compliance controle</li>
        </ol>
        
        <p>Tot ziens,<br>
        <strong>TransitAI Team</strong></p>
      `
    });

    res.json({ success: true, ticketId, message: 'Offerte request submitted' });
  } catch (error) {
    console.error('Offerte error:', error);
    res.status(500).json({ error: 'Failed to process offerte' });
  }
});

// ──────────────────────────────────────────────────────────────
// QUIZ RESULTS SUBMISSION
// ──────────────────────────────────────────────────────────────
app.post('/api/quiz-results', async (req, res) => {
  try {
    const { name, email, score, breakdown, orgType } = req.body;
    
    if (!name || !email || typeof score !== 'number') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ticketId = uuidv4().slice(0, 8).toUpperCase();
    const timestamp = new Date().toISOString();

    tickets[ticketId] = {
      type: 'quiz_result',
      ticketId,
      name,
      email,
      score,
      breakdown,
      orgType,
      timestamp,
      status: 'new'
    };

    const riskLevel = score < 40 ? 'Laag' : score < 65 ? 'Gemiddeld' : 'Hoog';
    const breakdownHtml = breakdown 
      ? breakdown.map(b => `<li>${b.cat}: <strong>${b.score}%</strong></li>`).join('')
      : '';

    // Email to company
    await resend.emails.send({
      from: 'noreply@transitai.nl',
      to: COMPANY_EMAIL,
      subject: `[Ticket: ${ticketId}] Quiz resultaat van ${name} (Risico: ${riskLevel})`,
      html: `
        <h2>Nieuwe quiz deelnemer</h2>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Organisatietype:</strong> ${orgType || 'Onbekend'}</p>
        <hr>
        <h3>Resultaten</h3>
        <p><strong>Risicoscore:</strong> <span style="font-size: 24px; font-weight: bold;">${score}%</span> (${riskLevel})</p>
        ${breakdownHtml ? `<h4>Verdeling per categorie:</h4><ul>${breakdownHtml}</ul>` : ''}
        <hr>
        <p><small>Ontvangen: ${new Date(timestamp).toLocaleString('nl-NL')}</small></p>
      `
    });

    // Personalized email to customer based on score
    const riskAdvice = score < 40 
      ? 'uw organisatie heeft een laag risico, maar blijft waakzaam'
      : score < 65
      ? 'uw organisatie heeft een gemiddeld risico dat aandacht vereist'
      : 'uw organisatie loopt een hoog risico en moet snel actie ondernemen';

    await resend.emails.send({
      from: 'noreply@transitai.nl',
      to: email,
      subject: `Uw AI Act Risicoscan resultaten – Ticket #${ticketId}`,
      html: `
        <h2>Uw AI Act Risicoscan Resultaten</h2>
        <p>Hallo ${name},</p>
        <p>Dank u wel voor het invullen van onze gratis AI Act risicoscan. 
        Hier zijn uw personaliseerde resultaten.</p>
        
        <p><strong>Uw ticket nummer:</strong> <code>${ticketId}</code></p>
        
        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">RISICOSCORE</p>
          <p style="margin: 10px 0 0 0; font-size: 48px; font-weight: bold; color: #1a56db;">${score}%</p>
          <p style="margin: 10px 0 0 0; color: #333;"><strong>${riskLevel} risico</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Op basis van uw antwoorden concluderen we dat ${riskAdvice}.</p>
        </div>
        
        ${breakdownHtml ? `
        <h3>Verdeling per categorie</h3>
        <ul>${breakdownHtml}</ul>
        ` : ''}
        
        <h3>Waarom dit belangrijk is</h3>
        <p>De EU AI Act is niet langer toekomstmuziek — het is <strong>wettelijk van kracht</strong>. 
        Dit betekent:</p>
        <ul>
          <li><strong>Boetes:</strong> Tot €35 miljoen voor niet-naleving</li>
          <li><strong>Schadeclaims:</strong> Klanten kunnen aansprakelijk stellen</li>
          <li><strong>Reputatie:</strong> Vertrouwensverlies bij stakeholders</li>
        </ul>
        
        <h3>De TransitAI Werkwijze</h3>
        <ol>
          <li><strong>Gratis consult (dit moment):</strong> We analyseren uw scan en geven feedback</li>
          <li><strong>Gedetailleerde audit:</strong> We beoordelen alle AI-toepassingen</li>
          <li><strong>Actieplan:</strong> Prioritering en concrete stappen</li>
          <li><strong>Implementatie:</strong> Juridische en technische ondersteuning</li>
          <li><strong>Controle:</strong> Voortdurende naleving en updates</li>
        </ol>
        
        <h3>Volgende stap</h3>
        <p>Wij nemen binnen <strong>24 uur</strong> contact met u op voor een gratis adviesgesprek 
        waarin we dit verder met u uitwerken.</p>
        
        <p>Tot ziens,<br>
        <strong>TransitAI Team</strong></p>
      `
    });

    res.json({ success: true, ticketId, message: 'Quiz results submitted' });
  } catch (error) {
    console.error('Quiz results error:', error);
    res.status(500).json({ error: 'Failed to process quiz results' });
  }
});

// ──────────────────────────────────────────────────────────────
// GET TICKET STATUS
// ──────────────────────────────────────────────────────────────
app.get('/api/ticket/:id', (req, res) => {
  const ticket = tickets[req.params.id];
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  res.json(ticket);
});

// ──────────────────────────────────────────────────────────────
// GET ALL TICKETS (admin only - in production: add auth)
// ──────────────────────────────────────────────────────────────
app.get('/api/admin/tickets', (req, res) => {
  res.json({
    total: Object.keys(tickets).length,
    tickets: Object.values(tickets)
  });
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
