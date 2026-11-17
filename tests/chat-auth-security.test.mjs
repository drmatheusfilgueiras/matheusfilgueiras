import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const content = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('contact cards retain their original structure and footer is separate', async () => {
  const page = await content('src/pages/AppleTestPage.jsx');
  const contact = page.indexOf('<section id="contato-apple"');
  const close = page.indexOf('</section>', contact);
  const footer = page.indexOf('<footer className="bg-[#0066cc]', contact);
  assert.ok(contact !== -1 && close > contact && footer > close);
  assert.match(page.slice(contact, close), /Salud Odontologia/);
  assert.match(page.slice(contact, close), /Naturale Dental Studio/);
  assert.match(page.slice(contact, close), /Outros contatos/);
});

test('no public JavaScript file contains the chat-control shared access key', async () => {
  for (const path of ['src/lib/chatFlowConfig.js', 'src/pages/ChatControlPage.jsx']) {
    const source = await content(path);
    assert.doesNotMatch(source, /CHAT_CONTROL_ACCESS_KEY|CHAT_CONTROL_KEY_STORAGE|X-Chat-Control-Key/);
    assert.doesNotMatch(source, /sessionStorage\.setItem\(/);
  }
  const config = await content('src/lib/chatFlowConfig.js');
  assert.match(config, /\/api\/chat-auth\.php/);
  assert.match(config, /credentials: 'same-origin'/);
});

test('PHP endpoints validate server-side sessions without source-controlled fallback hashes', async () => {
  const auth = await content('public/api/_chat-auth.php');
  assert.match(auth, /'httponly' => true/);
  assert.match(auth, /'secure' => true/);
  assert.match(auth, /'samesite' => 'Strict'/);
  assert.match(auth, /CHAT_CONTROL_KEY_HASH/);
  assert.match(auth, /\.chat-control-key-hash/);
  assert.match(auth, /session_regenerate_id\(true\)/);
  for (const path of ['public/api/chat-flow-config.php', 'public/api/chat-conversations.php']) {
    const source = await content(path);
    assert.match(source, /chat_admin_is_authorized\(\)/);
    assert.doesNotMatch(source, /\$accessKeyHash|\$_GET\['key'\]/);
  }
});
