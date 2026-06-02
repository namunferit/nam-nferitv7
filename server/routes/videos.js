const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../lib/db');
const { verifyToken } = require('../middleware/auth');
const { regenerateSite } = require('../ssg/generator');

// GET /api/videos - admin & public
router.get('/', (req, res) => {
  const videos = readJSON('videos.json');
  const activeVideos = videos.filter(v => !v.deletedAt);
  res.json(activeVideos);
});

// POST /api/videos - admin only
router.post('/', verifyToken, (req, res) => {
  const { title, description, categoryId, embedUrl, thumbnail, duration } = req.body;

  if (!title || !categoryId || !embedUrl) {
    return res.status(400).json({ error: 'Başlık, kategori ve video URL alanları zorunludur.' });
  }

  const videos = readJSON('videos.json');

  const newVideo = {
    id: 'vid-' + Date.now(),
    title,
    description: description || '',
    categoryId,
    embedUrl,
    thumbnail: thumbnail || 'images/article4.png',
    duration: duration || '0 dk',
    status: 'published',
    createdAt: new Date().toISOString(),
    deletedAt: null
  };

  videos.push(newVideo);
  writeJSON('videos.json', videos);

  try {
    regenerateSite();
  } catch (err) {
    console.error('SSG Error:', err);
  }

  res.status(201).json(newVideo);
});

// PUT /api/videos/:id - admin only
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, description, categoryId, embedUrl, thumbnail, duration, status } = req.body;

  const videos = readJSON('videos.json');
  const index = videos.findIndex(v => v.id === id && !v.deletedAt);

  if (index === -1) {
    return res.status(404).json({ error: 'Video bulunamadı.' });
  }

  videos[index] = {
    ...videos[index],
    title: title !== undefined ? title : videos[index].title,
    description: description !== undefined ? description : videos[index].description,
    categoryId: categoryId !== undefined ? categoryId : videos[index].categoryId,
    embedUrl: embedUrl !== undefined ? embedUrl : videos[index].embedUrl,
    thumbnail: thumbnail !== undefined ? thumbnail : videos[index].thumbnail,
    duration: duration !== undefined ? duration : videos[index].duration,
    status: status !== undefined ? status : videos[index].status,
    updatedAt: new Date().toISOString()
  };

  writeJSON('videos.json', videos);

  try {
    regenerateSite();
  } catch (err) {
    console.error('SSG Error:', err);
  }

  res.json(videos[index]);
});

// DELETE /api/videos/:id - admin only (soft delete)
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const videos = readJSON('videos.json');
  const index = videos.findIndex(v => v.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Video bulunamadı.' });
  }

  videos[index].deletedAt = new Date().toISOString();
  writeJSON('videos.json', videos);

  try {
    regenerateSite();
  } catch (err) {
    console.error('SSG Error:', err);
  }

  res.json({ message: 'Video başarıyla silindi.' });
});

module.exports = router;
