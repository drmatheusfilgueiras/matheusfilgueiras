import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const pages = ['index', 'sobre', 'contato', 'privacidade', 'termos', 'unidos_pela_bravura'];

test('Public pages are pre-rendered with semantic content and canonical URLs', async () => {
  for (const name of pages) {
    const html = await read('dist/' + name + '.html');
    assert.match(html, /id="root" data-prerendered="true"/, name);
    assert.match(html, /<h1\b/, name);
    assert.match(html, /rel="canonical"/, name);
    assert.match(html, /application\/ld\+json/, name);
    assert.match(html, /type="text\/markdown"/, name);
    assert.doesNotMatch(html, /<div id="root"><\/div>/, name);
    const markdown = await read('dist/' + name + '.md');
    assert.ok(markdown.length >= 80, name + ' Markdown is missing');
  }
});

test('Home HTML carries public project narratives in the initial response', async () => {
  const html = await read('dist/index.html');
  for (const phrase of ['Unidos pela Bravura', 'Pesquisa de mestrado', 'Planejamento Estético Digital', 'Matheus Filgueiras']) {
    assert.ok(html.includes(phrase), phrase + ' not present in HTML');
  }
  assert.match(html, /"@type":"Person"|&quot;@type&quot;:&quot;Person&quot;/);
});

test('AI discovery endpoints and 404 file are real files', async () => {
  const llms = await read('dist/llms.txt');
  assert.match(llms, /^# Matheus Filgueiras/m);
  assert.match(llms, /^> /m);
  assert.match(llms, /\]\(https:\/\/matheusfilgueiras\.com\/index\.md\)/);
  const robots = await read('dist/robots.txt');
  assert.match(robots, /Content-Signal: search=yes, ai-train=no/);
  const card = JSON.parse(await read('dist/.well-known/mcp/server-card.json'));
  assert.ok(card.remotes[0].url.endsWith('/api/mcp.php'));
  assert.ok((await stat(new URL('../dist/api/mcp.php', import.meta.url))).size > 1000);
  const nf = await read('dist/404.html');
  assert.match(nf, /Página não encontrada/);
  assert.match(nf, /noindex/);
});

test('HTTP routes are configured for real 404 and Markdown negotiation', async () => {
  const htaccess = await read('dist/.htaccess');
  assert.match(htaccess, /ErrorDocument 404/);
  assert.match(htaccess, /RewriteRule \^ - \[R=404,L\]/);
  assert.match(htaccess, /HTTP:Accept.*text\/markdown/);
  assert.match(htaccess, /Header always set Link/);
});
