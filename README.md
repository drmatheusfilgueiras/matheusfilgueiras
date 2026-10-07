# matheusfilgueiras.com

Website pessoal de Matheus Carvalho Teles Filgueiras.

## Projeto

Site editorial e minimalista criado em Vite, React e Tailwind CSS, preparado para publicacao pela Hostinger a partir do GitHub.

## Rodar localmente

```bash
npm install
npm run dev
```

O site abre em `http://localhost:3000/`.

## Gerar versao de producao

```bash
npm run build
```

A pasta `dist/` e a versao final que a Hostinger publica.

## Planejador de PPR

O caminho `/ppr` contem um assistente educacional de planejamento biomecanico de Protese Parcial Removivel. A implementacao atual usa React para a interface, mas separa as regras clinicas da renderizacao:

- `src/lib/ppr/clinical-rules.js`: modelo de dados v2, estados dentarios e migracao basica.
- `src/lib/ppr/kennedy.js`: classificacao Kennedy/Applegate, areas edentulas, modificacoes e espacos ignorados.
- `src/lib/ppr/biomechanics.js`: suporte, linha de fulcro, retencao indireta, sugestoes de apoios/planos-guia e avaliacao RPI/RPA.
- `src/lib/ppr/render-svg.js`: coordenadas e helpers das camadas SVG.
- `src/lib/ppr/validation.js`: `validateDesign(state)` e checklist final.
- `src/pages/PprPlannerPage.jsx`: interface em oito etapas, persistencia local, desenho SVG progressivo e exportacao JSON.

### Regras implementadas

- Estados por dente: presente, ausente a repor, extracao planejada a repor, ausente sem reposicao e excluido como pilar.
- Kennedy/Applegate apos extracoes planejadas.
- Terceiros/segundos molares marcados como nao repostos sao ignorados.
- Area edentula mais posterior define a classe; modificacoes contam areas, nao extensao.
- Classe IV cruza a linha media e nao recebe modificacoes.
- Kennedy I/II ativam suporte dentomucoso, linha de fulcro e retencao indireta obrigatoria.
- Bases sao geradas apenas em `missing_replace` e `extract_replace`.
- RPI e RPA sao avaliados de forma condicional a partir dos dados de delineamento.
- `validateDesign` bloqueia arco totalmente edentulo, componente em dente para extracao, Classe I/II sem retencao indireta, retentor final sem delineamento essencial e I-bar com conflito anatomico informado.

### Regras deixadas manuais

Alguns pontos anatomicos nao possuem limiares quantitativos na especificacao fornecida. Por isso, conectores maiores, adequacao clinica final dos dentes candidatos e confirmacao da retencao indireta permanecem editaveis e explicados como decisoes dependentes de dados clinicos.

### Testes do motor de PPR

```bash
npm run test:ppr
```

Os testes cobrem Kennedy I, II, III e IV, espacos nao repostos, extracao planejada, retencao indireta obrigatoria, incompatibilidade de RPI/I-bar, alternativa RPA e remocao/bloqueio de componentes sobre dentes indicados para extracao.
