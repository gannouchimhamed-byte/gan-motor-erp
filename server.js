const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// ── Password protection ───────────────────────────────────────────
const PASSWORD = process.env.APP_PASSWORD || 'ganmotor2026';
const SESSIONS = new Set();

function randomToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

app.use(express.json());

// Login endpoint (no auth required)
app.post('/api/login', (req, res) => {
  if (req.body.password === PASSWORD) {
    const token = randomToken();
    SESSIONS.add(token);
    res.json({ ok: true, token });
  } else {
    res.status(401).json({ ok: false, error: 'Mot de passe incorrect' });
  }
});

// Auth middleware for all other /api routes
function requireAuth(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (token && SESSIONS.has(token)) return next();
  res.status(401).json({ error: 'Non autorisé' });
}

app.use('/api/data', requireAuth);
app.use('/api/reset', requireAuth);

// Serve login page for unauthenticated requests, app for authenticated
app.use(express.static(path.join(__dirname, 'public')));

// ── Ensure data directory exists ──────────────────────────────────
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// ── Default initial data ──────────────────────────────────────────
const DEFAULT_DATA = {
  cars: [],
  savs: [],
  carros: [],
  txns: [
    {id:"TXN-001",date:"2026-01-20",type:"entrée",cat:"BYD commission",label:"Commissions BYD Janvier",montant:4600,compte:"Banque"},
    {id:"TXN-002",date:"2026-01-31",type:"sortie",cat:"Salaire",label:"Salaire Yasmine Janvier",montant:620,compte:"Banque"},
    {id:"TXN-003",date:"2026-01-15",type:"entrée",cat:"SAV",label:"Paiement SAV Ben Ali",montant:280,compte:"Caisse"},
    {id:"TXN-004",date:"2026-01-18",type:"entrée",cat:"SAV",label:"Paiement SAV Gharbi",montant:520,compte:"Caisse"},
    {id:"TXN-005",date:"2026-01-22",type:"entrée",cat:"Carrosserie",label:"Règlement Sfar",montant:1150,compte:"Banque"},
    {id:"TXN-006",date:"2026-01-25",type:"entrée",cat:"Carrosserie",label:"Règlement Hamdi",montant:2800,compte:"Banque"},
    {id:"TXN-007",date:"2026-02-20",type:"entrée",cat:"BYD commission",label:"Commissions BYD Février",montant:3600,compte:"Banque"},
    {id:"TXN-008",date:"2026-02-28",type:"sortie",cat:"Salaire",label:"Salaire Yasmine Février",montant:660,compte:"Banque"},
    {id:"TXN-009",date:"2026-02-12",type:"entrée",cat:"SAV",label:"Paiement SAV Trabelsi",montant:90,compte:"Caisse"},
    {id:"TXN-010",date:"2026-02-20",type:"entrée",cat:"SAV",label:"Paiement SAV Mansour",montant:350,compte:"Caisse"},
    {id:"TXN-011",date:"2026-02-18",type:"entrée",cat:"Carrosserie",label:"Règlement Ben Salah",montant:650,compte:"Banque"},
    {id:"TXN-012",date:"2026-03-05",type:"entrée",cat:"BYD commission",label:"Commissions BYD Mars",montant:5800,compte:"Banque"},
    {id:"TXN-013",date:"2026-03-10",type:"entrée",cat:"Carrosserie",label:"Règlement Hamza",montant:580,compte:"Caisse"},
    {id:"TXN-014",date:"2026-03-08",type:"sortie",cat:"Charges",label:"Loyer local GAN Motor",montant:1200,compte:"Banque"},
    {id:"TXN-015",date:"2026-03-09",type:"sortie",cat:"Charges",label:"Fournitures bureau",montant:150,compte:"Caisse"},
  ],
  recvs: [
    {id:"CRE-001",client:"Karoui Sami",label:"Carrosserie Dolphin",montant:950,dateEcheance:"2026-03-25",statut:"En attente"},
    {id:"CRE-002",client:"Nasri Amira",label:"Carrosserie Atto 3",montant:4200,dateEcheance:"2026-04-10",statut:"En attente"},
    {id:"CRE-003",client:"Jebali Farouk",label:"Sinistre Qin Plus",montant:800,dateEcheance:"2026-04-05",statut:"En attente"},
    {id:"CRE-004",client:"Rejeb Mouna",label:"Tang facturée",montant:0,dateEcheance:"2026-03-30",statut:"En attente"},
  ],
  pays: [
    {id:"DET-001",fournisseur:"Loyer",label:"Loyer Avril",montant:1200,dateEcheance:"2026-04-05",statut:"En attente"},
    {id:"DET-002",fournisseur:"Pièces SAV",label:"Commande pièces",montant:850,dateEcheance:"2026-03-28",statut:"En attente"},
    {id:"DET-003",fournisseur:"Yasmine",label:"Commissions Mars",montant:340,dateEcheance:"2026-03-31",statut:"En attente"},
    {id:"DET-004",fournisseur:"Assurance",label:"Prime trimestrielle",montant:480,dateEcheance:"2026-04-01",statut:"En attente"},
  ]
};

// ── DB helpers ────────────────────────────────────────────────────
function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ── API Routes ────────────────────────────────────────────────────
// Get all data
app.get('/api/data', (req, res) => {
  res.json(readDB());
});

// Save all data (full replace)
app.post('/api/data', (req, res) => {
  try {
    writeDB(req.body);
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Reset to default
app.post('/api/reset', (req, res) => {
  writeDB(JSON.parse(JSON.stringify(DEFAULT_DATA)));
  res.json({ ok: true });
});

// ── Serve frontend ────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GAN Motor ERP running on port ${PORT}`);
});
