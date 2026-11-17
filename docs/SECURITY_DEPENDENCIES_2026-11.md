# Segurança das dependências — 17/11/2026

## Correções concluídas

- **Vite 7.3.8**: corrige os avisos conhecidos de `launch-editor` presentes no Vite anterior. O pacote `launch-editor` não está instalado como dependência independente neste repositório.
- **Zod 4.6.7**: corrige o consumo excessivo de memória.
- **source-map-js 1.2.2**: corrige bloqueio da thread em mapas indexados.
- **brace-expansion 1.1.22**: corrige três problemas de negação de serviço.
- **postcss-selector-parser 6.1.6**: corrige complexidade quadrática em seletores planos.

## Problema novo detectado pela auditoria completa

`GHSA-fc5q-39xc-vjpf` / `CVE-2026-112366` — vulnerabilidade de ReDoS por extglobs repetidos em `picomatch` (e nos pacotes que dependem dele).

**Estado:** ainda sem versão oficial corrigida publicada no npm na data desta revisão. O relatório pode exibir diversos caminhos de dependência para o mesmo advisory; isso não equivale a várias vulnerabilidades independentes. Não declarar essa falha como resolvida.

## Análise de exposição

O site público é composto por arquivos HTML, CSS e JavaScript compilados, além dos endpoints PHP do projeto. `picomatch`, `tailwindcss` e `vite` são utilizados na etapa de compilação/desenvolvimento, não como serviço Node.js que processe padrões glob enviados por visitantes.

O plugin `tailwindcss-animate`, anteriormente classificado como dependência de execução, foi movido para `devDependencies`. O lockfile foi reconciliado com o próprio npm: 74 entradas passaram à classificação `dev: true`, sem atualização de versões nesse ajuste.

Medidas de contenção:
- Servir apenas `dist` na Hostinger; não publicar `node_modules`, arquivos de configuração, nem servidor `vite dev`.
- Manter `vite dev` ligado somente a `127.0.0.1`.
- Não aceitar expressões glob arbitrárias de usuários nos processos Node.
- Atualizar `picomatch` tão logo uma versão oficial corrigida esteja disponível.

## Política de validação contínua

GitHub Actions executa:
1. `npm ci`
2. `npm audit --omit=dev --audit-level=low`, que **deve passar sem qualquer alerta de produção**.
3. `node scripts/security-audit.mjs`, que exige identificação dos advisories presentes e rejeita novos alertas, aceitando **somente** a exceção documentada de `GHSA-fc5q-39xc-vjpf` enquanto o npm indicar ausência de correção disponível. Essa exceção é reportada como aviso, nunca como vulnerabilidade corrigida.
4. Compilação, testes de páginas estáticas, controles do chat e sintaxe PHP.

Quando houver uma correção de `picomatch`, o teste deve falhar até que a dependência seja atualizada, pois a exceção deixa de ser válida.

## Escopo e limitações

Esta revisão aborda advisories de dependências npm. Ela não substitui testes de penetração, análise de endpoints PHP, atualização de credenciais na Hostinger nem verificação de infraestrutura. Falhas específicas da hospedagem devem ser verificadas na produção após a publicação.
