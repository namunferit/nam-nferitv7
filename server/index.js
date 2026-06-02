require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { regenerateSite } = require('./ssg/generator');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure foundational directories exist
const ROOT_DIR = path.join(__dirname, '..');
const DB_DIR = path.join(ROOT_DIR, 'db');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// CORS configuration
app.use(cors());

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static directories
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/admin', express.static(path.join(ROOT_DIR, 'admin', 'dist')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/media', require('./routes/media'));

// Serve public static site
app.use(express.static(PUBLIC_DIR));

// Fallback to index.html for spa behavior under /admin
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'admin', 'dist', 'index.html'));
});

// Fallback to homepage for public site
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Initial build on start
try {
  regenerateSite();
} catch (err) {
  console.error('Initial SSG compilation failed:', err);
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});
