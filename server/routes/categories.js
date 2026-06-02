const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../lib/db');
const { verifyToken } = require('../middleware/auth');
const slugify = require('slugify');

// GET /api/categories - public or admin
router.get('/', (req, res) => {
  const categories = readJSON('categories.json');
  const articles = readJSON('articles.json');
  const videos = readJSON('videos.json');

  // Add counts of articles and videos
  const enriched = categories.map(cat => {
    let count = 0;
    if (cat.type === 'article') {
      count = articles.filter(a => a.categoryId === cat.id && !a.deletedAt).length;
    } else if (cat.type === 'video') {
      count = videos.filter(v => v.categoryId === cat.id && !v.deletedAt).length;
    }
    return { ...cat, count };
  });

  res.json(enriched);
});

// POST /api/categories - admin only
router.post('/', verifyToken, (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Kategori adı ve türü (article/video) gereklidir.' });
  }

  const categories = readJSON('categories.json');
  const slug = slugify(name, { lower: true, strict: true });

  // Check if exists
  if (categories.find(c => c.slug === slug && c.type === type)) {
    return res.status(400).json({ error: 'Bu isimde bir kategori zaten mevcut.' });
  }

  const newCategory = {
    id: 'cat-' + Date.now(),
    name,
    slug,
    type
  };

  categories.push(newCategory);
  writeJSON('categories.json', categories);

  res.status(201).json(newCategory);
});

// PUT /api/categories/:id - admin only
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Kategori adı ve türü gereklidir.' });
  }

  const categories = readJSON('categories.json');
  const index = categories.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Kategori bulunamadı.' });
  }

  const slug = slugify(name, { lower: true, strict: true });

  // Update
  categories[index] = {
    ...categories[index],
    name,
    slug,
    type
  };

  writeJSON('categories.json', categories);
  res.json(categories[index]);
});

// DELETE /api/categories/:id - admin only
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  const categories = readJSON('categories.json');
  const category = categories.find(c => c.id === id);

  if (!category) {
    return res.status(404).json({ error: 'Kategori bulunamadı.' });
  }

  // Check if category is used in articles or videos
  const articles = readJSON('articles.json');
  const videos = readJSON('videos.json');

  const inUseArticles = articles.filter(a => a.categoryId === id && !a.deletedAt);
  const inUseVideos = videos.filter(v => v.categoryId === id && !v.deletedAt);

  if (inUseArticles.length > 0 || inUseVideos.length > 0) {
    return res.status(400).json({
      error: 'Bu kategoriye ait aktif içerikler var. Silmek için önce bu içerikleri başka kategoriye taşıyın veya silin.'
    });
  }

  const filtered = categories.filter(c => c.id !== id);
  writeJSON('categories.json', filtered);

  res.json({ message: 'Kategori başarıyla silindi.' });
});

module.exports = router;
