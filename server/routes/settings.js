const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../lib/db');
const { verifyToken } = require('../middleware/auth');
const { regenerateSite } = require('../ssg/generator');

// GET /api/settings - public
router.get('/', (req, res) => {
  const settings = readJSON('settings.json');
  res.json(settings);
});

// PUT /api/settings - admin only
router.put('/', verifyToken, (req, res) => {
  const settings = req.body;

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Geçersiz ayar verisi.' });
  }

  writeJSON('settings.json', settings);

  // Trigger site regeneration when settings change (colors, fonts, layout, title etc.)
  try {
    regenerateSite();
    res.json({ message: 'Ayarlar güncellendi ve site yeniden oluşturuldu.', settings });
  } catch (err) {
    console.error('SSG Error:', err);
    res.status(500).json({ error: 'Ayarlar güncellendi fakat statik site yeniden oluşturulurken hata meydana geldi.', settings });
  }
});

module.exports = router;
