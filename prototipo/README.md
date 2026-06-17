# Protótipo visual — Construtor de Cronogramas SUBHUE

Protótipo navegável em **React + Vite** que demonstra a UX da ferramenta com
**dados simulados** (nenhum backend necessário). O objetivo é validar o layout
simples e o fluxo completo antes de investir na implementação do backend Django.

## Como rodar

```pwsh
cd prototipo
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## O que dá para fazer

- **Painel** — KPIs, acesso rápido aos módulos, planos recentes.
- **Planos / Cronogramas** — listagem com busca, filtro por status, valor mensal/anual.
- **Novo cronograma** — assistente passo a passo (identificação → ponto de partida → bases → SEI → revisão).
- **Construção** (tela central) — 3 colunas:
  - esquerda: **árvore** da unidade (setores/serviços) com indicador de pendência;
  - centro: configuração do setor em **abas** (Resumo, Parâmetros, Equipe/RH, Custeio, Produção, Regras, Histórico);
  - direita: **resumo financeiro**, completude e pendências clicáveis.
- **Aplicar preset** — modal com modelos por setor/especialidade (ex.: *Psiquiatria — 02 leitos*).
- **Equipe / RH** — tabela editável; edite a quantidade e o custo recalcula; selo de origem (preset/regra/manual).
- **Memória de cálculo** — modal mostrando a fórmula (salário → encargos → benefícios → custo).
- **Checklist de completude**, **Simulação de cenários** (what-if em memória) e
  **Cronograma financeiro** (planilha com blocos, meses, parte fixa, custeio e total).
- **Cadastros e bases** (3 grupos) — Estrutura (unidades, tipos de setor, serviços,
  especialidades, variáveis obrigatórias), Base salarial e custos (categorias, regimes,
  naturezas/turnos, perfis, tabelas salariais, rubricas, **encargos por grupos A–E**,
  benefícios com regras), Regras e modelos (normativas, **composições normativas**,
  regras de quadro, regras de custeio, presets).
- **Composição de normativas** — ao criar o plano dá para combinar **várias RDCs/normativas**
  em ordem de precedência (passo "Bases e regras" do assistente).
- **Cenário Com / Sem CEBAS** — seletor na Construção e no Cronograma e comparação completa
  na Simulação (com a economia mensal/anual). O CEBAS zera o Grupo A dos encargos (INSS
  patronal); o cálculo vem dos grupos A–E, não de um percentual fixo.
- **Termo Aditivo** — a partir de um cronograma que vai encerrar, cria-se um aditivo com
  reajuste salarial e meses adicionais (período mês 13–24+), reaproveitando estrutura e
  quadro. Alterna entre "Contrato original" e "Termo Aditivo" e compõe com o cenário CEBAS.
- **Construção do zero** — no assistente, escolher "Começar do zero" abre um plano em branco.
  Na Construção dá para **adicionar setor/serviço** (calculável ou agrupador; o tipo de setor
  já traz as variáveis obrigatórias), **adicionar/remover profissionais** (com prévia de custo)
  e **adicionar/remover custeio**. Os totais e as pendências recalculam na hora.
- **Aplicar regra de quadro** — dimensiona a equipe automaticamente a partir dos parâmetros
  (leitos) e das regras das normativas (proporcional por leito/posto, mínimo fixo), com
  prévia e seleção antes de materializar (origem = Regra).
- **Aba Produção** — cadastro de metas físicas (consultas, procedimentos, exames, cirurgias…).
- **Ações de nó** — renomear, duplicar e excluir setor/serviço direto no cabeçalho.
- **Acompanhamento / SEI / Ciclo de vida** (`/plano/:id/acompanhamento`) — ciclo de vida do
  plano (rascunho → validado → apurado → cronograma → enviado ao SEI → aprovado → fechado;
  arquivar/reabrir), processo SEI editável, exportações e versões.
- **Cadastros CRUD** — o botão "Novo" abre formulário (orientado por schema) que adiciona o
  registro à lista; ações de plano na listagem (abrir, cronograma, acompanhamento, duplicar).
- **Quantitativos inteiros** — profissionais são sempre números inteiros (regras arredondam
  para cima; inputs com passo 1).
- **Editor de presets** — em Cadastros › Presets dá para criar/editar um preset com seus
  parâmetros e a equipe (perfis + quantitativos inteiros).
- **Tabelas salariais cadastráveis** — em Cadastros › Tabelas salariais, grade editável com
  **todos os perfis** e todas as rubricas (base, insalubridade, gratificação, titulação,
  adicional noturno → salário total); criar nova tabela copiando de outra.
- **Perfis cadastráveis** — novo perfil já é registrado nas tabelas salariais.
- **Cadastros com formulário completo** — além dos catálogos de texto: **Tipo de setor**,
  **Rubricas** (grupo, tipo, forma, %, incidência, entra no cronograma), **Variáveis
  obrigatórias** (por tipo de setor), **Composições normativas** (normativas ordenadas por
  precedência) e **Regras de quadro / RH** (normativa, perfil, estratégia, variável, fator,
  mínimo, arredondamento).

## Roteiro sugerido para validar com o time (cada ambiente)

1. **Painel** → visão geral e acesso rápido.
2. **Novo cronograma** → assistente; testar **composição de normativas** e **"Começar do zero"**.
3. **Construção** (plano em branco) → adicionar setor (vem com variáveis obrigatórias) →
   **Aplicar regra de quadro** → ajustar quantitativos → custeio → produção → alternar **CEBAS**.
4. **Completude** → ver pendências e ir corrigir.
5. **Simulação** → comparação **Sem/Com CEBAS** e what-if.
6. **Cronograma** → planilha por bloco; **criar Termo Aditivo** (reajuste + meses).
7. **Acompanhamento** → transições de status, vincular SEI, exportações.
8. **Cadastros** → percorrer os 3 grupos; testar **Novo** (ex.: Unidades, Encargos A–E).

> Itens intencionalmente não implementados no protótipo (são "stubs" rotulados): exportação
> de Excel/PDF, anexar ao SEI e a busca global do topo. Tudo o mais é navegável.

> O modelo de cálculo (encargos por grupos A–E, CEBAS/imunidade tributária, apoio à gestão
> CGE+RUE, benefícios com elegibilidade) foi qualificado a partir da planilha real — ver
> [`../ANALISE_PLANILHA.md`](../ANALISE_PLANILHA.md).

## Cenário de demonstração

O plano *Plano Assistencial CER Centro 2026* já vem montado com o setor de
**Psiquiatria de 2 leitos** e demais setores, cobrindo todos os critérios de aceite
(criar/abrir plano → configurar setor → ver equipe → editar quantitativo →
calcular salário/encargos/benefícios → consolidar → cronograma de 12 meses).

## Como isto vira o frontend real do `plano_trabalho`

A camada de dados está isolada em `src/mock/`:

| Protótipo (mock)            | Endpoint real (ver `../API.md`)                          |
| --------------------------- | -------------------------------------------------------- |
| `getBootstrap()`            | `GET /plano-trabalho/api/bootstrap/`                     |
| `listPlanos()` / `getPlano` | `GET /plano-trabalho/api/planos/`                        |
| `getEstrutura(id)`          | `GET /planos/{id}/estrutura/`                            |
| `findNo` + `calcEscopo`     | `GET /planos/{id}/estrutura/nos/{no}/configuracao/`      |
| `setQuantidade/setParametro`| `PUT .../configuracao/`                                  |
| `aplicarPreset`             | `POST .../aplicar-regras-quadro/` + `aplicar-regras-rubrica/` |
| `getCompletude(id)`         | `GET /planos/{id}/checklist-completude/`                 |
| simulação                   | `POST /planos/{id}/simular/`                             |
| `getCronograma(id)`         | `POST /planos/{id}/cronogramas/gerar/`                   |

Para integrar: troque o conteúdo de `src/mock/api.js` por chamadas `fetch` aos
endpoints acima (mantendo as mesmas assinaturas de função), configure o proxy de
`/plano-trabalho/api` no `vite.config.js` e descarte `src/mock/db.js`. As telas
(`src/pages/*`) não precisam mudar.

> O **motor de cálculo** do mock (`calcPerfil`, `calcItemQuadro`, `calcEscopo`,
> `getCronograma`) é só para o protótipo. No produto real, o cálculo vive no
> backend (`services/calculo.py`) e o frontend apenas exibe os resultados.

## Estrutura

```
prototipo/
├─ src/
│  ├─ main.jsx, App.jsx          # bootstrap + rotas
│  ├─ styles.css                 # design system (azul/branco/cinza)
│  ├─ components/                # AppShell (sidebar/topbar/busca) + ui (badges, modal, KPI)
│  ├─ lib/format.js              # moeda, números, competências pt-BR
│  ├─ mock/db.js                 # dados simulados (catálogos + plano demo)
│  ├─ mock/api.js                # "API" + motor de cálculo (ponto de troca p/ Django)
│  └─ pages/                     # Dashboard, Planos, NovoPlano, Construcao, Cronograma,
│                                #   Completude, Simulacao, Cadastros
```
