# Proteção do painel de chat no servidor

O painel `/chat_control` utiliza login validado por PHP, sem chave fixa no JavaScript. As chamadas administrativas dependem de uma sessão PHP em cookie `HttpOnly; Secure; SameSite=Strict`, válida por até 2 horas (ou até expirar a sessão na hospedagem).

**A chave anterior apareceu no histórico público do Git. É indispensável definir uma chave nova e forte. Não reutilize a antiga.**

## Passo 1 — Gerar a nova chave e seu hash, sem divulgá-la

No próprio computador, escolha uma senha/chave longa e exclusiva, preferencialmente gerada por um gerenciador de senhas (20 ou mais caracteres aleatórios). Não a envie por chat, e-mail ou repositório.

Com Python instalado, abra o terminal e execute:

```bash
python -c "import getpass,hashlib; print(hashlib.sha256(getpass.getpass('Nova chave do painel: ').encode('utf-8')).hexdigest())"
```

Digite a chave quando solicitado. Ela não aparece na tela. Copie **somente o resultado hexadecimal de 64 caracteres** (hash SHA-256). Guarde a chave original com segurança no gerenciador de senhas. O hash é o valor que será configurado no servidor.

## Passo 2 — Configurar a Hostinger (uma das alternativas)

### Alternativa A: variável de ambiente PHP

Se o painel de hospedagem permitir variáveis de ambiente para os processos PHP, configure a variável `CHAT_CONTROL_KEY_HASH` com o hash obtido. Não configure a senha em texto puro. Reinicie o serviço PHP se necessário.

### Alternativa B: arquivo privado fora de public_html (recomendado em hospedagem compartilhada)

1. No hPanel, abra **Websites → Gerenciar → Gerenciador de arquivos**.
2. Navegue até a pasta do domínio, **um nível acima de `public_html`**. Ela deve conter a própria pasta `public_html`; o local exato pode variar por plano.
3. Crie um arquivo de texto chamado exatamente `.chat-control-key-hash` nessa pasta **externa a `public_html`**.
4. Escreva no arquivo **apenas o hash hexadecimal de 64 caracteres**, sem aspas, espaços, JSON ou prefixos.
5. Salve. Quando houver controle de permissões, restrinja a leitura ao usuário da hospedagem (por exemplo, `600`).
6. **Não crie esse arquivo dentro de `public_html`, `api` ou do repositório Git.**

O servidor procura, nesta ordem, `CHAT_CONTROL_KEY_HASH` (variável de ambiente válida) e o arquivo privado em `dirname(__DIR__, 2)/.chat-control-key-hash` a partir de `public_html/api/_chat-auth.php`.

## Passo 3 — Publicar o código atualizado

Faça o deploy da branch `main` do repositório `drmatheusfilgueiras/matheusfilgueiras` na Hostinger, com `npm run build` e diretório de saída `dist`. Confirme que a hospedagem executa PHP para os arquivos `/api/*.php` e mantém as sessões PHP habilitadas.

## Passo 4 — Testar o acesso

1. Abra `https://matheusfilgueiras.com/api/chat-auth.php`. Antes do login, deverá responder em JSON com `authorized: false`.
2. Abra `https://matheusfilgueiras.com/chat_control`. Informe a **nova** chave.
3. O painel deve liberar o acesso após a validação no servidor. Atualize a página para testar a restauração da sessão.
4. Salve uma mudança não sensível no fluxo e confira se ela foi gravada.
5. Use o botão **Sair**; o painel deve voltar a solicitar autenticação.
6. Teste uma chave incorreta. Ela deve ser rejeitada sem liberar o painel.

## Problemas comuns

- **“O acesso do painel ainda precisa ser configurado”**: `CHAT_CONTROL_KEY_HASH` não chegou ao PHP e o arquivo privado não foi encontrado ou não contém 64 caracteres hexadecimais.
- **Autenticação funciona, mas o painel volta a pedir a chave**: confirme HTTPS, suporte a sessões PHP e permissões de armazenamento das sessões.
- **404 ou HTML no lugar de JSON em `/api/chat-auth.php`**: a publicação não inclui o PHP ou a hospedagem está redirecionando `/api` para a aplicação React.
- **Chave incorreta após configuração**: confira se o hash foi gerado com exatamente a chave digitada e sem espaços adicionais.

## Segurança e reversibilidade

- A chave em texto puro nunca é compilada no JavaScript e não é enviada novamente após o login.
- O arquivo privado permanece fora da raiz pública; não faça backup dele em repositórios públicos.
- Não coloque o hash em `.htaccess` ou em código versionado.
- É possível trocar a chave a qualquer momento substituindo o hash no servidor. Sessões previamente autenticadas continuam válidas até seu vencimento; para revogação imediata, invalide as sessões PHP da hospedagem ou adote controle de versão de sessão.
- O acesso administrativo requer HTTPS, cookies e sessões PHP.
