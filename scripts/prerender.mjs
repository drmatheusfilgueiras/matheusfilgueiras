import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';

const DOMAIN = 'https://matheusfilgueiras.com';
const pages = [
  ['/', 'index.html', 'index.md'],
  ['/sobre', 'sobre.html', 'sobre.md'],
  ['/contato', 'contato.html', 'contato.md'],
  ['/privacidade', 'privacidade.html', 'privacidade.md'],
  ['/termos', 'termos.html', 'termos.md'],
  ['/unidos_pela_bravura', 'unidos_pela_bravura.html', 'unidos_pela_bravura.md'],
  ['/pre_validation_book', 'pre_validation_book.html', 'pre_validation_book.md']
];

const baseTemplate = await readFile('dist/index.html', 'utf8');
if (!baseTemplate.includes('<div id="root"></div>')) {
  throw new Error('Prerender requires an empty #root container in the Vite output.');
}

function decodeHtml(input) {
  return input.replace(/&(#(?:x[0-9a-f]+|[0-9]+)|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity) => {
    const simple = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
    if (simple[entity]) return simple[entity];
    const num = entity[0] === '#' && entity[1]?.toLowerCase() === 'x'
      ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
    return Number.isFinite(num) && num > 0 && num <= 0x10ffff ? String.fromCodePoint(num) : '';
  });
}

function toMarkdown(markup) {
  let text = markup.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
      const labelText = decodeHtml(label.replace(/<[^>]+>/g, ' ').trim());
      return labelText ? '[' + labelText + '](' + href + ')' : '';
    });
  for (let level = 6; level >= 1; level--) {
    const re = new RegExp('<h' + level + '\\b[^>]*>([\\s\\S]*?)<\\/h' + level + '>', 'gi');
    text = text.replace(re, (_, heading) => '\n\n' + '#'.repeat(level) + ' ' + heading.replace(/<[^>]+>/g, '') + '\n\n');
  }
  text = text.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(?:article|section|main|footer|div|figure|ul)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00a0/g, ' ');
  text = decodeHtml(text)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text + '\n';
}

const server = await createServer({
  configFile: 'vite.config.js',
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'error'
});

try {
  const { renderPage } = await server.ssrLoadModule('/src/entry-server.jsx');
  const stripDefaultHead = baseTemplate
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>/i, '');
  for (const [pathname, target, markdownFile] of pages) {
    const { markup, head } = renderPage(pathname);
    if (!markup.includes('<h1') || !head.includes('rel="canonical"')) {
      throw new Error('Missing semantic content or canonical for ' + pathname);
    }
    const name = pathname === '/' ? 'index' : pathname.slice(1);
    const robots = pathname === '/pre_validation_book' ? '<meta name="robots" content="noindex,nofollow" />\n' : '';
    const alternate = '<link rel="alternate" type="text/markdown" href="/' + markdownFile + '" />\n' +
      '<link rel="describedby" type="text/plain" href="/llms.txt" />\n';
    const output = stripDefaultHead
      .replace('</head>', robots + head + '\n' + alternate + '</head>')
      .replace('<div id="root"></div>', '<div id="root" data-prerendered="true">' + markup + '</div>');
    await writeFile('dist/' + target, output, 'utf8');
    await writeFile('dist/' + markdownFile, toMarkdown(markup), 'utf8');
    if (name === 'index') await writeFile('dist/index.html.md', toMarkdown(markup), 'utf8');
    console.info('Prerendered', pathname, '=>', target, '(' + markup.length + ' HTML chars)');
  }
  const notFound = stripDefaultHead
    .replace('</head>', '<title>404 | Página não encontrada</title><meta name="robots" content="noindex" /></head>')
    .replace('<div id="root"></div>', '<main style="max-width:650px;margin:14vh auto;padding:2rem;font-family:sans-serif"><h1>Página não encontrada</h1><p>O endereço solicitado não existe.</p><a href="/">Voltar ao site</a></main>')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  await writeFile('dist/404.html', notFound, 'utf8');
  const indexMd = await readFile('dist/index.md', 'utf8');
  if (indexMd.length < 1600 || !indexMd.includes('Unidos pela Bravura')) {
    throw new Error('Index Markdown has too little content to be useful.');
  }
  console.info('Prerender complete; markdown characters:', indexMd.length);
} finally {
  await server.close();
}
