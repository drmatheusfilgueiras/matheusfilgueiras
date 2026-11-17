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

test('Institutional links remain in footer only, with structured identity in homepage HTML', async () => {
  const html = await read('dist/index.html');
  const hero = html.slice(0, html.indexOf('id="sobre-apple"'));
  const footer = html.slice(html.indexOf('aria-label="Informações institucionais"'));
  for (const path of ['/sobre', '/contato', '/privacidade', '/termos']) {
    assert.ok(!hero.includes('href="' + path + '"'), 'Institutional link must not appear in hero: ' + path);
    assert.ok(footer.includes('href="' + path + '"'), 'Missing institutional link in footer: ' + path);
  }
  assert.match(html, /"@type":"Organization"|&quot;@type&quot;:&quot;Organization&quot;/);
  assert.match(html, /"@type":"Person"|&quot;@type&quot;:&quot;Person&quot;/);
  assert.ok(html.includes('Matheus Filgueiras'));
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
  assert.equal(card.protocolVersion, '2025-06-18');
  assert.equal(card.serverInfo.name, card.name);
  assert.equal(card.serverInfo.version, card.version);
  assert.equal(card.transport.endpoint, '/api/mcp.php');
  assert.deepEqual(card.capabilities, { tools: { listChanged: false } });
  assert.equal(card.authentication.required, false);
  assert.equal(card.tools, 'dynamic');
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

test('Institutional pages keep the primary site visual design and navigation', async () => {
  for (const name of ['sobre', 'contato', 'privacidade', 'termos']) {
    const html = await read('dist/' + name + '.html');
    assert.match(html, /class="apple-test min-h-screen/, name + ' must use the main typography and design');
    assert.match(html, /bg-\[#0066cc\]/, name + ' must retain the site blue');
    assert.match(html, /aria-label="Navegação principal"/, name + ' must have a main navigation');
    assert.match(html, /href="\/\#projetos-apple"/, name + ' must link to the main portfolio');
    assert.match(html, /aria-label="Links institucionais"/, name + ' must have footer navigation');
    assert.match(html, /href="\/llms\.txt"/, name + ' must keep the technical link');
    assert.match(html, /Converse comigo/, name + ' must retain the floating contact assistant');
    assert.equal((html.match(/<h1\b/g) || []).length, 1, name + ' must have one h1');
  }
  const contact = await read('dist/contato.html');
  assert.match(contact, /Salud Odontologia/);
  assert.match(contact, /Naturale Dental Studio/);
  assert.match(contact, /matheusfilgueiras\.dr@gmail\.com/);
  const about = await read('dist/sobre.html');
  assert.match(about, /retrato-editorial-hero\.jpg/);
  const llms = await read('dist/llms.txt');
  assert.match(llms, /^# Matheus Filgueiras/m);
});
