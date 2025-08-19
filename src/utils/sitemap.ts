export const generateSitemap = () => {
  const baseUrl = 'https://toolzhub-5014-31157.web.app';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/generate', priority: '0.9', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { url: '/blog', priority: '0.7', changefreq: 'daily' },
    { url: '/login', priority: '0.5', changefreq: 'monthly' },
    { url: '/register', priority: '0.5', changefreq: 'monthly' }
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static pages
  staticPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
};
