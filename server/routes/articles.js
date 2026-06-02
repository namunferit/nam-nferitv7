const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../lib/db');
const { verifyToken } = require('../middleware/auth');
const { regenerateSite } = require('../ssg/generator');
const slugify = require('slugify');

// Simple reading time estimator (average 200 words per minute)
function calculateReadTime(htmlContent) {
  if (!htmlContent) return 1;
  const cleanText = htmlContent.replace(/<[^>]*>/g, '');
  const wordCount = cleanText.trim().split(/\s+/).length;
  const time = Math.ceil(wordCount / 200);
  return time > 0 ? time : 1;
}

// GET /api/articles - public & admin
router.get('/', (req, res) => {
  const articles = readJSON('articles.json');
  const includeDeleted = req.query.deleted === 'true';

  let filtered = articles;
  if (!includeDeleted) {
    filtered = articles.filter(a => !a.deletedAt);
  }

  res.json(filtered);
});

// GET /api/articles/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const articles = readJSON('articles.json');
  const article = articles.find(a => a.id === id);

  if (!article) {
    return res.status(404).json({ error: 'Yazı bulunamadı.' });
  }

  res.json(article);
});

// POST /api/articles - admin only
router.post('/', verifyToken, (req, res) => {
  const { title, author, authorBio, categoryId, content, coverImage, status, featured } = req.body;

  if (!title || !categoryId || !content) {
    return res.status(400).json({ error: 'Başlık, kategori ve içerik alanları zorunludur.' });
  }

  const articles = readJSON('articles.json');
  let slug = slugify(title, { lower: true, strict: true });

  // Handle unique slug
  let slugConflict = articles.find(a => a.slug === slug);
  let counter = 1;
  while (slugConflict) {
    slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
    slugConflict = articles.find(a => a.slug === slug);
    counter++;
  }

  const readTime = calculateReadTime(content);

  const newArticle = {
    id: 'art-' + Date.now(),
    title,
    slug,
    author: author || 'Nâmünferit Editör',
    authorBio: authorBio || 'Nâmünferit Dijital Kültür Platformu yazarı.',
    categoryId,
    content,
    coverImage: coverImage || 'images/article1.png',
    readTime,
    status: status || 'draft',
    featured: !!featured,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  };

  // If featured is set to true, optionally unset other featured articles?
  // Let's keep it simple: multiple featured is fine, or we can just save it.
  articles.push(newArticle);
  writeJSON('articles.json', articles);

  try {
    regenerateSite();
  } catch (err) {
    console.error('SSG Error:', err);
  }

  res.status(201).json(newArticle);
});

// PUT /api/articles/:id - admin only
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, author, authorBio, categoryId, content, coverImage, status, featured, slug } = req.body;

  const articles = readJSON('articles.json');
  const index = articles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Yazı bulunamadı.' });
  }

  // Update slug if it changes or if specifically passed
  let newSlug = articles[index].slug;
  if (slug && slug !== articles[index].slug) {
    newSlug = slugify(slug, { lower: true, strict: true });
    // Check collision
    let slugConflict = articles.find(a => a.slug === newSlug && a.id !== id);
    let counter = 1;
    while (slugConflict) {
      newSlug = `${slugify(slug, { lower: true, strict: true })}-${counter}`;
      slugConflict = articles.find(a => a.slug === newSlug && a.id !== id);
      counter++;
    }
  } else if (title && title !== articles[index].title && !slug) {
    newSlug = slugify(title, { lower: true, strict: true });
    let slugConflict = articles.find(a => a.slug === newSlug && a.id !== id);
    let counter = 1;
    while (slugConflict) {
      newSlug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
      slugConflict = articles.find(a => a.slug === newSlug && a.id !== id);
      counter++;
    }
  }

  const readTime = content !== undefined ? calculateReadTime(content) : articles[index].readTime;

  articles[index] = {
    ...articles[index],
    title: title !== undefined ? title : articles[index].title,
    slug: newSlug,
    author: author !== undefined ? author : articles[index].author,
    authorBio: authorBio !== undefined ? authorBio : articles[index].authorBio,
    categoryId: categoryId !== undefined ? categoryId : articles[index].categoryId,
    content: content !== undefined ? content : articles[index].content,
    coverImage: coverImage !== undefined ? coverImage : articles[index].coverImage,
    readTime,
    status: status !== undefined ? status : articles[index].status,
    featured: featured !== undefined ? !!featured : articles[index].featured,
    updatedAt: new Date().toISOString()
  };

  writeJSON('articles.json', articles);

  try {
    regenerateSite();
  } catch (err) {
    console.error('SSG Error:', err);
  }

  res.json(articles[index]);
});

// POST /api/articles/:id/restore - admin only
router.post('/:id/restore', verifyToken, (req, res) => {
  const { id } = req.params;
  const articles = readJSON('articles.json');
  const index = articles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Yazı bulunamadı.' });
  }

  articles[index].deletedAt = null;
  writeJSON('articles.json', articles);

  try {
    regenerateSite();
  } catch (err) {
    console.error('SSG Error:', err);
  }

  res.json({ message: 'Yazı çöp kutusundan geri yüklendi.', article: articles[index] });
});

// DELETE /api/articles/:id - admin only (soft delete)
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const articles = readJSON('articles.json');
  const index = articles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Yazı bulunamadı.' });
  }

  // If already soft-deleted, we can do hard delete or toggle. The plan calls for soft delete.
  articles[index].deletedAt = new Date().toISOString();
  writeJSON('articles.json', articles);

  try {
    regenerateSite();
  } catch (err) {
    console.error('SSG Error:', err);
  }

  res.json({ message: 'Yazı çöp kutusuna taşındı.' });
});

module.exports = router;
