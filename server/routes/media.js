const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const { verifyToken } = require('../middleware/auth');
const { regenerateSite } = require('../ssg/generator');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer in-memory storage for sharp optimization
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Yalnızca resim dosyaları (.jpg, .jpeg, .png, .webp, .gif) yüklenebilir.'));
  }
});

// GET /api/media - admin only
router.get('/', verifyToken, (req, res) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.json([]);
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    const mediaFiles = files.map(file => {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        url: `/uploads/${file}`,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });

    // Sort by newest
    mediaFiles.sort((a, b) => b.createdAt - a.createdAt);
    res.json(mediaFiles);
  } catch (err) {
    res.status(500).json({ error: 'Medya dosyaları listelenirken bir hata oluştu.' });
  }
});

// POST /api/media/upload - admin only
router.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Lütfen bir dosya seçin.' });
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const basename = path.basename(req.file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    const filename = `${basename}-${Date.now()}.webp`; // Store all as optimized webp
    const destPath = path.join(UPLOADS_DIR, filename);

    // Optimize with sharp: convert to webp, reduce quality to 80%
    await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toFile(destPath);

    // Regenerate site to ensure assets are synced
    try {
      regenerateSite();
    } catch (e) {
      console.error('Failed to regenerate site during upload:', e);
    }

    res.status(201).json({
      message: 'Dosya başarıyla yüklendi ve optimize edildi.',
      filename,
      url: `/uploads/${filename}`
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Dosya yüklenirken veya işlenirken bir hata oluştu.' });
  }
});

// DELETE /api/media/:filename - admin only
router.delete('/:filename', verifyToken, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Dosya bulunamadı.' });
  }

  try {
    fs.unlinkSync(filePath);

    // Regenerate site to ensure assets are synced
    try {
      regenerateSite();
    } catch (e) {
      console.error('Failed to regenerate site during deletion:', e);
    }

    res.json({ message: 'Dosya başarıyla silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Dosya silinirken bir hata oluştu.' });
  }
});

// PUT /api/media/:filename - admin only (Rename)
router.put('/:filename', verifyToken, (req, res) => {
  const { filename } = req.params;
  const { newFilename } = req.body;

  if (!newFilename) {
    return res.status(400).json({ error: 'Yeni dosya adı gereklidir.' });
  }

  const oldPath = path.join(UPLOADS_DIR, filename);
  const newPath = path.join(UPLOADS_DIR, newFilename);

  if (!fs.existsSync(oldPath)) {
    return res.status(404).json({ error: 'Dosya bulunamadı.' });
  }

  if (fs.existsSync(newPath)) {
    return res.status(400).json({ error: 'Bu isimde bir dosya zaten mevcut.' });
  }

  try {
    fs.renameSync(oldPath, newPath);

    // Regenerate site to ensure assets are synced
    try {
      regenerateSite();
    } catch (e) {
      console.error('Failed to regenerate site during rename:', e);
    }

    res.json({
      message: 'Dosya başarıyla yeniden adlandırıldı.',
      filename: newFilename,
      url: `/uploads/${newFilename}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Dosya adı değiştirilirken bir hata oluştu.' });
  }
});

module.exports = router;
