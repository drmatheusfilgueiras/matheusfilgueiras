# Deploy na Hostinger

Este projeto gera um site estático. Isso é bom para a Hostinger porque a publicação é simples e rápida.

## Opção 1: Deploy manual

1. Rodar `npm run build`.
2. Enviar o conteúdo da pasta `dist/` para a pasta pública do domínio na Hostinger.
3. Apontar o domínio `matheusfilgueiras.com` para a hospedagem.

## Opção 2: Deploy pelo GitHub

Depois que o repositório existir no GitHub, podemos configurar uma automação para:

1. gerar o build automaticamente;
2. enviar os arquivos para a Hostinger;
3. atualizar o site a cada mudança aprovada.

Para isso, vamos precisar dos dados de publicação da Hostinger, normalmente:

- host FTP;
- usuário FTP;
- senha FTP;
- pasta remota de publicação.

Esses dados entram como `secrets` no GitHub, nunca diretamente no código.
