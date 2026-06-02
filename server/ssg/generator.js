const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const ROOT_DIR = path.join(__dirname, '..', '..');
const DB_DIR = path.join(ROOT_DIR, 'db');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Format date helper for Handlebars
Handlebars.registerHelper('formatDate', function (dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
});

function loadJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return [];
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
  } catch (err) {
    console.error(`Error copying ${src} to ${dest}:`, err);
  }
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function updateCSSVariables(settings) {
  const cssPath = path.join(ROOT_DIR, 'style.css');
  const destCssPath = path.join(PUBLIC_DIR, 'style.css');

  if (!fs.existsSync(cssPath)) {
    console.warn('Original style.css not found at root!');
    return;
  }

  let cssContent = fs.readFileSync(cssPath, 'utf8');

  // Replace root variables based on settings
  if (settings.colors) {
    const colors = settings.colors;
    const colorReplacements = {
      '--burgundy': colors.burgundy,
      '--burgundy-light': colors.burgundyLight || colors.burgundy,
      '--black': colors.black,
      '--cream': colors.cream,
      '--off-white': colors.offWhite
    };

    for (const [key, value] of Object.entries(colorReplacements)) {
      if (value) {
        const regex = new RegExp(`${key}:\\s*[^;]+;`, 'g');
        cssContent = cssContent.replace(regex, `${key}: ${value};`);
      }
    }
  }

  if (settings.fonts) {
    const fonts = settings.fonts;
    if (fonts.serif) {
      cssContent = cssContent.replace(/--font-serif:\s*[^;]+;/, `--font-serif: '${fonts.serif}', Georgia, serif;`);
    }
    if (fonts.sans) {
      cssContent = cssContent.replace(/--font-sans:\s*[^;]+;/, `--font-sans: '${fonts.sans}', -apple-system, sans-serif;`);
    }
  }

  fs.writeFileSync(destCssPath, cssContent, 'utf8');
}

function regenerateSite() {
  console.log('Regenerating static site...');

  // 1. Ensure public directories exist
  ensureDir(PUBLIC_DIR);
  ensureDir(path.join(PUBLIC_DIR, 'images'));
  ensureDir(path.join(PUBLIC_DIR, 'uploads'));

  // 2. Load DB files
  const articles = loadJSON(path.join(DB_DIR, 'articles.json'));
  const videos = loadJSON(path.join(DB_DIR, 'videos.json'));
  const categories = loadJSON(path.join(DB_DIR, 'categories.json'));
  const settings = loadJSON(path.join(DB_DIR, 'settings.json'));

  // Filter categories
  const articleCategories = categories.filter(c => c.type === 'article');
  const videoCategories = categories.filter(c => c.type === 'video');

  // Filter active and non-deleted content
  const activeArticles = articles.filter(a => a.status === 'published' && !a.deletedAt);
  const activeVideos = videos.filter(v => v.status === 'published' && !v.deletedAt);

  // Map category details onto articles and videos for templating
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const enrichedArticles = activeArticles.map(a => {
    const cat = categoryMap.get(a.categoryId);
    return {
      ...a,
      categoryName: cat ? cat.name : 'Genel',
      categorySlug: cat ? cat.slug : 'genel'
    };
  });

  const enrichedVideos = activeVideos.map(v => {
    const cat = categoryMap.get(v.categoryId);
    return {
      ...v,
      categoryName: cat ? cat.name : 'Genel',
      categorySlug: cat ? cat.slug : 'genel'
    };
  });

  // Sort articles and videos by date descending
  enrichedArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  enrichedVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Recent content for homepage
  const homeArticlesLimit = settings.homepage?.articlesCount || 3;
  const homeVideosLimit = settings.homepage?.videosCount || 3;
  const recentArticles = enrichedArticles.slice(0, homeArticlesLimit);
  const recentVideos = enrichedVideos.slice(0, homeVideosLimit);

  // 3. Inject and copy CSS
  updateCSSVariables(settings);

  // 4. Copy static assets and non-templated pages
  copyFile(path.join(ROOT_DIR, 'script.js'), path.join(PUBLIC_DIR, 'script.js'));
  copyFile(path.join(ROOT_DIR, 'hakkimizda.html'), path.join(PUBLIC_DIR, 'hakkimizda.html'));
  copyFile(path.join(ROOT_DIR, 'topluluk.html'), path.join(PUBLIC_DIR, 'topluluk.html'));
  copyFile(path.join(ROOT_DIR, 'yazi-gonder.html'), path.join(PUBLIC_DIR, 'yazi-gonder.html'));

  if (fs.existsSync(path.join(ROOT_DIR, 'images'))) {
    copyDir(path.join(ROOT_DIR, 'images'), path.join(PUBLIC_DIR, 'images'));
  }
  if (fs.existsSync(path.join(ROOT_DIR, 'uploads'))) {
    copyDir(path.join(ROOT_DIR, 'uploads'), path.join(PUBLIC_DIR, 'uploads'));
  }

  // 5. Compile and generate index.html
  const indexTemplateSource = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.template.html'), 'utf8');
  const indexTemplate = Handlebars.compile(indexTemplateSource);
  const indexHtml = indexTemplate({
    site: settings.site,
    hero: settings.hero,
    social: settings.social,
    recentArticles,
    recentVideos
  });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), indexHtml, 'utf8');

  // 6. Compile and generate yazilar.html
  const yazilarTemplateSource = fs.readFileSync(path.join(TEMPLATES_DIR, 'yazilar.template.html'), 'utf8');
  const yazilarTemplate = Handlebars.compile(yazilarTemplateSource);
  const yazilarHtml = yazilarTemplate({
    site: settings.site,
    categories: articleCategories,
    articles: enrichedArticles
  });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'yazilar.html'), yazilarHtml, 'utf8');

  // 7. Compile and generate videolar.html
  const videolarTemplateSource = fs.readFileSync(path.join(TEMPLATES_DIR, 'videolar.template.html'), 'utf8');
  const videolarTemplate = Handlebars.compile(videolarTemplateSource);
  const videolarHtml = videolarTemplate({
    site: settings.site,
    videoCategories: videoCategories,
    videos: enrichedVideos
  });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'videolar.html'), videolarHtml, 'utf8');

  // 8. Compile and generate yazi-detay-[slug].html for each article
  const detayTemplateSource = fs.readFileSync(path.join(TEMPLATES_DIR, 'yazi-detay.template.html'), 'utf8');
  const detayTemplate = Handlebars.compile(detayTemplateSource);

  for (const article of enrichedArticles) {
    const formattedDate = Handlebars.helpers.formatDate(article.createdAt);
    const authorInitial = article.author ? article.author.charAt(0).toUpperCase() : 'N';
    const yaziHtml = detayTemplate({
      site: settings.site,
      title: article.title,
      coverImage: article.coverImage,
      categoryName: article.categoryName,
      author: article.author,
      authorBio: article.authorBio,
      authorInitial,
      formattedDate,
      readTime: article.readTime,
      content: article.content
    });
    fs.writeFileSync(path.join(PUBLIC_DIR, `yazi-detay-${article.slug}.html`), yaziHtml, 'utf8');
  }

  console.log('Static site regenerated successfully.');
}

module.exports = { regenerateSite };
