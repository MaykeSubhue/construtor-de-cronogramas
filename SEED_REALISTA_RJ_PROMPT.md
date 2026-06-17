# Power Prompt — Seed Realista de Catálogos, Regras e Cenário Carioca

> **Status operacional atual:** este arquivo e um briefing historico de concepcao.
> Ele cita nomes antigos como `seed_realista_rj`. Na arvore atual, o comando
> versionado e `python manage.py seed_plano_trabalho`. Use
> [SEEDS.md](./SEEDS.md) como contrato operacional vigente.

> **Status do documento:** briefing/roadmap. Este arquivo descreve a ambição do seed realista e pode conter desejos ainda não implementados no app. Para estado atual do schema e fluxo v1, use `docs/models`.

> **Como usar este documento.** Ele tem dois papéis:
> 1. É o **briefing técnico** para implementar o seed funcional do `plano_trabalho`.
> 2. É um **prompt completo** que pode ser entregue a um agente (Claude / Copilot / outro) para executar autonomamente.
>
> Toda a numerologia (quantitativos, salários, encargos, valores de procedimento) está **citada com norma de origem**. Quando a fonte é estimativa de mercado, isso é dito explicitamente. Não inventar valores que não estejam aqui ou em fonte citada.

---

## 0. Persona do leitor final (lembre-se sempre)

A pessoa que vai usar a interface **não é modelador de dados**. É **enfermeira chefe**, **diretor adjunto** ou **analista da SUBHUE** que precisa montar o plano de trabalho de uma unidade da SMS-Rio em poucas horas e defendê-lo numa reunião. Ela:
- conhece RDC 7, COFEN 543, Portaria 312, MAC/FAEC, mas raramente os artigos exatos;
- pensa em "leitos", "plantonistas", "produção mensal", "isenção CEBAS", "incorporação de IST";
- **não pensa em** "FK", "EAV", "estratégia proporcional";
- vai abandonar o sistema se precisar configurar 40 telas antes de ver um número.

Portanto o seed deve produzir, ao final do `python manage.py seed_plano_trabalho`, **um plano demonstrável já calculado** para uma unidade típica (ex.: UPA tipo III), com produção esperada, quadro dimensionado e custo mensal coerente com a realidade da SMS-Rio.

---

## 1. Domínio modelado (resumo executivo, com nomes exatos)

### 1.1 Catálogos (`plano_trabalho/models/catalogos.py`)
- `TipoNoEstrutura`, `TipoSetor`, `CategoriaProfissional`, `RegimeTrabalho`, `NaturezaAtuacao`
- `PerfilAlocacao` = (Categoria × Regime × Natureza) — **identidade canônica do posto**
- `Rubrica`, `GrupoRubrica` (provento / benefício / encargo / provisão)
- `DefinicaoVariavel` (ex.: `leitos_operacionais`, `aplica_cebas`, `dias_uti_mes`) com flags `aplicavel_no_no/escopo/consolidado`
- `CompatibilidadeTipoSetorVariavel` — matriz que diz "leitos_operacionais vale para UTI, não vale para Ambulatório"

### 1.2 Plano e estrutura (`models/planos.py`)
- `ObjetoPlanejamento` (a unidade real, com CNES) → `PlanoTrabalho` (versão de planejamento) → `VariantePlano` (cenário sem/com CEBAS)
- `NoPlano` (árvore: unidade → serviço → setor → sala) → `EscopoPlano` (recorte calculável)
- `ItemQuadroEscopo` (perfil × quantidade planejada no escopo)
- `ValorVariavelPlano` (valores das variáveis no nó/escopo/consolidado)
- `CompetenciaPlano` (eixo temporal mensal)

### 1.3 Regras (`models/regras.py`)
- `ConjuntoRegras` (versionado por norma: RDC 7/2010, COFEN 543/2017, etc.)
- `RegraQuadroPessoal` + `CondicaoRegraQuadroPessoal` + `FaixaRegraQuadroPessoal`
  - estratégias: `proporcional`, `minimo_fixo`, `por_faixa`, `formula`
  - arredondamento: `nenhum / cima / baixo / matematico`
  - flag `aplica_ist` (Índice de Segurança Técnica COFEN — discutido em 5.2)
- `RegraRubrica` + `CondicaoRegraRubrica`
  - estratégias: `valor_fixo`, `percentual_sobre_base`, `valor_por_quantidade`, `formula`
  - bases: `salario_base / rubrica_especifica / grupo_rubrica / subtotal_posicao / subtotal_escopo / variavel / quantidade_elegiveis`
  - níveis de incidência: `posicao / escopo / consolidado`

### 1.4 Salários (`models/salarios.py`)
- `TabelaSalarial` (data de referência) → `ItemTabelaSalarial` (por perfil): `salario_base`, `percentual_insalubridade`, `valor_gratificacao_responsavel_tecnico`, `valor_gratificacao_chefia`, `valor_titulacao`, `percentual_adicional_noturno`, `quantidade_vale_transporte_dia / refeicao_dia / alimentacao_dia`

### 1.5 Produção e custeio (`models/producao_e_custeio.py`)
- `ProcedimentoEscopo` (produção esperada — opcionalmente vinculável a SIGTAP, ver §G3)
- `ComponenteCusteioEscopo` (insumo / contrato / locação / serviço terceirizado)
- `CalendarioOperacionalEscopo` (dias_funcionamento_semana, semanas_funcionamento_ano)

### 1.6 Resultados (`models/resultados.py`) e cronograma (`models/cronogramas.py`)
- `ApuracaoPlano` → `PosicaoPlanejada`, `ResultadoProducaoEscopo`, `ItemCustoApurado` → `ItemCustoMensalApurado` → `ConsolidadoResultadoEscopo` → `ConsolidadoResultadoMensalEscopo`
- `CronogramaFinanceiro` → `BlocoCronograma` → `ParcelaCronograma`

---

## 2. Universo carioca real a representar no seed

A SMS-Rio opera por **Áreas Programáticas (APs)** 1.0, 2.1, 2.2, 3.1, 3.2, 3.3, 4.0, 5.1, 5.2, 5.3. O seed deve criar **`ObjetoPlanejamento` para 6 unidades-tipo representativas** (uma por nível de complexidade):

| Cód. seed | Nome | CNES | Tipo | AP | Realidade |
|---|---|---|---|---|---|
| `HMSA` | Hospital Municipal Souza Aguiar | 2270032 | Hospital geral de emergência (porta aberta) | 1.0 | Referência em trauma; ~360 leitos |
| `HMMC` | Hospital Municipal Miguel Couto | 2270059 | Hospital geral | 2.1 | ~280 leitos; Zona Sul |
| `HMSF` | Hospital Municipal Salgado Filho | 2273007 | Hospital geral de emergência | 3.2 | ~260 leitos; Méier |
| `HMRG` | Hospital Municipal Ronaldo Gazolla | 6918586 | Hospital especializado (DIP) | 3.3 | Foco infectologia/COVID; ~190 leitos |
| `UPA-PEN` | UPA 24h da Penha | 7591628 | UPA porte III | 3.1 | 7-9 leitos observação adulto + ped |
| `CER-LEB` | Centro Especializado em Reabilitação Leblon (modelo) | — | Ambulatório/CER tipo IV | 2.1 | Especialidades + reabilitação |

> Os CNES acima são **reais** (consultáveis em <https://cnes.datasus.gov.br/>). O seed deve gravá-los em `ObjetoPlanejamento.cnes` para permitir futuro casamento com o app `cnes/` deste repositório.

### 2.1 Tipos de Setor a cadastrar
Cobrir os tipos que aparecem nas 6 unidades acima:

```text
uti_adulto             — UTI Adulto (RDC 7/2010 art. 14)
uti_pediatrica         — UTI Pediátrica (RDC 7/2010 art. 14)
uti_neonatal           — UTI Neonatal (RDC 7/2010 art. 14)
unidade_intermediaria  — Cuidados intermediários (UCI)
emergencia_adulto      — Emergência adulto / sala vermelha / sala amarela
emergencia_pediatrica  — Emergência pediátrica
clinica_medica         — Internação adulto clínica
clinica_cirurgica      — Internação adulto cirúrgica
pediatria_internacao   — Internação pediátrica
maternidade_alojamento — Alojamento conjunto
centro_obstetrico      — Centro obstétrico
centro_cirurgico       — Bloco cirúrgico
cme                    — Central de Material e Esterilização
ambulatorio_especialidades — Consultas eletivas multiprofissionais
acolhimento_classificacao  — Acolhimento e classificação de risco (Manchester)
upa_observacao         — Sala de observação UPA (até 24h)
servico_apoio_diagnostico  — Imagem/laboratório/anatomia
farmacia_hospitalar
servico_administrativo
hemodialise
```

### 2.2 Categorias profissionais e regimes
Categorias mínimas:
```text
medico_intensivista, medico_emergencista, medico_clinico, medico_pediatra,
medico_obstetra, medico_cirurgiao_geral, medico_anestesista, medico_radiologista,
enfermeiro_assistencial, enfermeiro_obstetra, enfermeiro_intensivista,
tecnico_enfermagem, fisioterapeuta, fisioterapeuta_intensivista,
fonoaudiologo, psicologo, assistente_social, nutricionista, farmaceutico,
biomedico, tecnico_radiologia, tecnico_laboratorio,
auxiliar_administrativo, recepcionista, maqueiro, auxiliar_servicos_gerais
```

Regimes (carga horária real praticada na SMS-Rio):
```text
diarista_20h         (CH semanal 20, mensal ~86,67h)   — ambulatórios, alguns médicos
diarista_24h         (CH semanal 24, mensal ~104h)     — médicos clínicos/cirúrgicos
diarista_30h         (CH semanal 30, mensal ~130h)     — enfermeiros administrativos
diarista_36h         (CH semanal 36, mensal ~156h)     — Lei 7.498/86 enfermagem
diarista_40h         (CH semanal 40, mensal ~173,33h)
plantao_12x36_diurno (12h on/36h off; ~104h mês)
plantao_12x36_noturno (12h on/36h off; ~104h mês + adic. noturno)
plantao_24x72        (24h on/72h off; médicos plantonistas)
sobreaviso           (variação, modulado em horas)
```

### 2.3 Naturezas de atuação
```text
assistencial            — execução direta da assistência
supervisao_local        — supervisão de turno/setor
coordenacao_setor       — coordenação técnica do setor
responsavel_tecnico     — RT do serviço (RDC 7 art. 13)
chefia_unidade          — gerência de unidade
apoio_administrativo
apoio_diagnostico
```

---

## 3. Conjuntos de regras a cadastrar

Criar **5 `ConjuntoRegras`** versionados (cada um cita a norma fonte):

| Código | Nome | Vigência | Norma de base |
|---|---|---|---|
| `RDC_7_2010_UTI` | RDC 7/2010 — UTI (mínimos) | 2010-02-24 — sem fim | ANVISA RDC 7/2010 |
| `COFEN_543_2017_ENFERMAGEM` | COFEN 543/2017 — Dimensionamento de Enfermagem | 2017-04-12 — sem fim | Resolução COFEN 543/2017 |
| `PORT_2048_URGENCIA` | Portaria 2.048/2002 — Urgência e Emergência | 2002-11-05 — sem fim | Portaria GM/MS 2.048/2002 |
| `PORT_104_2014_UPA` | Portaria 104/2014 — UPA 24h | 2014-01-15 — sem fim | Portaria GM/MS 104/2014 |
| `SMS_RIO_BASE_2026` | SMS-Rio — Diretriz interna 2026 | 2026-01-01 — sem fim | Diretriz fictícia para custeio/produção local |

Cada `RegraQuadroPessoal` e `RegraRubrica` deve apontar para o `ConjuntoRegras` correto, com `referencia_fonte` literal (ex.: `"RDC ANVISA 7/2010, art. 14, II"`).

---

## 4. Variáveis de plano (`DefinicaoVariavel`) a cadastrar

> **Princípio.** Variável é o que o usuário responde por área. Sem variáveis bem definidas, regra não calcula. Deixe `ajuda` legível e exemplo numérico.

### 4.1 Variáveis estruturais (nível NÓ ou ESCOPO)
```text
leitos_operacionais        decimal   — leitos efetivamente em operação
leitos_totais              decimal   — leitos cadastrados no CNES (teto)
salas_funcionamento        decimal   — salas operatórias / consultórios em uso
horas_funcionamento_dia    decimal   — 24h, 12h, 8h
dias_funcionamento_semana  inteiro   — 5, 6, 7
demanda_classificada_dia   inteiro   — atendimentos classificados/dia (acolhimento)
taxa_ocupacao_alvo         decimal   — % esperado (ex.: 0.85)
permanencia_media_dias     decimal   — LOS médio
giro_leito_mes             decimal   — saídas / leito / mês
```

### 4.2 Variáveis normativas / de regime
```text
aplica_cebas                      booleano  — se sim, isenta cota patronal INSS 20%
aplica_ist                        booleano  — se sim, multiplica quadro de enfermagem por (1+IST)
ist_percentual                    decimal   — default 0,15 (COFEN 543, mínimo recomendado)
percentual_absenteismo            decimal   — default 0,12 — não é COFEN; estimativa SMS-Rio
fator_cobertura_folgas            decimal   — 0,2089 (5×7/365 simplificado p/ enfermagem)
classificacao_scp                 select    — minimo / intermediario / alta_dependencia / semi_intensivo / intensivo (COFEN 543 anexo)
horas_assistencia_paciente_dia    decimal   — derivado da SCP (ver §5.2)
```

### 4.3 Variáveis de produção
```text
producao_consultas_mes_estimada   inteiro
producao_consultas_meta_mes       inteiro
producao_aih_mes                  inteiro
producao_sadt_mes                 inteiro
producao_cirurgias_mes            inteiro
producao_partos_mes               inteiro
```

### 4.4 Variáveis de custeio
```text
percentual_encargos_patronais     decimal  — default 0,72 (sem CEBAS) / 0,52 (com CEBAS) — ver §6
valor_diaria_uti_referencia       decimal  — Tabela SUS FAEC/MAC; valor de referência interno
valor_consulta_referencia         decimal  — SIA-SUS
percentual_provisao_ferias_13     decimal  — default 0,1233 (~1/12 + 1/3 férias)
percentual_fgts                   decimal  — 0,08
```

### 4.5 Compatibilidades (`CompatibilidadeTipoSetorVariavel`) — exemplos
- `leitos_operacionais` aplicável a: UTI*, Unidade Intermediária, Internações, Maternidade, UPA Observação
- `salas_funcionamento` aplicável a: Centro Cirúrgico, Centro Obstétrico, Ambulatório
- `demanda_classificada_dia` aplicável a: Emergência*, Acolhimento, UPA Observação
- `producao_consultas_mes_estimada` aplicável a: Ambulatório
- `classificacao_scp` aplicável a: todas as áreas com leito

---

## 5. Regras de quadro (`RegraQuadroPessoal`) — núcleo normativo

### 5.1 Bloco UTI Adulto (RDC 7/2010 art. 14)

> **Citações literais** (RDC 7/2010, art. 14, com fonte verificada em <https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2010/res0007_24_02_2010.html>):
> - II — Médicos plantonistas: **mínimo 1 para cada 10 leitos ou fração, em cada turno** (assumir 4 turnos = 6×6h ou 2×12h; o seed usa 12×36, então 2 turnos cobrindo 24h × cobertura 4,5).
> - III — Enfermeiros assistenciais: **mínimo 1 para cada 8 leitos ou fração, em cada turno**.
> - IV — Fisioterapeutas: **mínimo 1 para cada 10 leitos ou fração, nos turnos manhã, tarde e noite** (18h diárias).
> - V — Técnicos de enfermagem: **mínimo 1 para cada 2 leitos em cada turno + 1 técnico por UTI para apoio em cada turno**.
> - I — Médico diarista/rotineiro: **1 para cada 10 leitos ou fração, manhã e tarde**.

Traduzir em regras (todas no `ConjuntoRegras = RDC_7_2010_UTI`):

| código regra | tipo_setor | perfil_alocacao | estratégia | base | quantidade | arredondamento | aplica_ist |
|---|---|---|---|---|---|---|---|
| `RDC7-UTI-A-MED-DIA` | uti_adulto | medico_intensivista @ diarista_24h @ assistencial | proporcional | leitos_operacionais | 1 / 10 | cima | não |
| `RDC7-UTI-A-MED-PLT` | uti_adulto | medico_intensivista @ plantao_24x72 @ assistencial | proporcional | leitos_operacionais | (1/10) × 4,5 | cima | não |
| `RDC7-UTI-A-ENF-PLT` | uti_adulto | enfermeiro_intensivista @ plantao_12x36_diurno @ assistencial | proporcional | leitos_operacionais | (1/8) × 2,14 | cima | sim |
| `RDC7-UTI-A-ENF-PLT-N` | uti_adulto | enfermeiro_intensivista @ plantao_12x36_noturno @ assistencial | proporcional | leitos_operacionais | (1/8) × 2,14 | cima | sim |
| `RDC7-UTI-A-TEC-PLT` | uti_adulto | tecnico_enfermagem @ plantao_12x36_diurno @ assistencial | proporcional | leitos_operacionais | (1/2) × 2,14 + 2,14 | cima | sim |
| `RDC7-UTI-A-TEC-PLT-N` | uti_adulto | tecnico_enfermagem @ plantao_12x36_noturno @ assistencial | proporcional | leitos_operacionais | (1/2) × 2,14 + 2,14 | cima | sim |
| `RDC7-UTI-A-FIS` | uti_adulto | fisioterapeuta_intensivista @ plantao_12x36_diurno @ assistencial | proporcional | leitos_operacionais | (1/10) × 1,5 | cima | sim |
| `RDC7-UTI-A-RT-MED` | uti_adulto | medico_intensivista @ diarista_20h @ responsavel_tecnico | minimo_fixo | — | 1 | nenhum | não |
| `RDC7-UTI-A-COORD-ENF` | uti_adulto | enfermeiro_intensivista @ diarista_36h @ coordenacao_setor | minimo_fixo | — | 1 | nenhum | não |
| `RDC7-UTI-A-COORD-FIS` | uti_adulto | fisioterapeuta_intensivista @ diarista_30h @ coordenacao_setor | minimo_fixo | — | 1 | nenhum | não |

> **Sobre o fator 2,14 e 4,5.** Fator de cobertura para regime 12×36 = **(7×24)/(12×7) ≈ 2,0** mais reposição de folgas/férias/feriados ≈ **2,14**. Para 24×72 (médico plantonista cobrindo 24h) = **(7×24)/24 = 7 / 1,55 ≈ 4,5** considerando folgas. Documentar esses fatores em `RegimeTrabalho.descricao` (e expor em microcopy do front).

> **Sobre IST.** A RDC 7 dá o mínimo. A COFEN 543/2017 art. 7º manda **acrescer no mínimo 15% ao quantitativo de enfermagem** para cobrir absenteísmo previsível. O seed deve marcar `aplica_ist = true` em todas as regras de enfermagem das UTIs e definir `ist_percentual = 0,15` como variável padrão do plano.

### 5.2 Bloco internação por SCP (COFEN 543/2017)

A COFEN 543/2017 traz **horas de assistência de enfermagem por paciente/dia** (HE/PD):

| Classificação SCP | HE / paciente / dia | Distribuição enfermeiro / técnico |
|---|---|---|
| Cuidado mínimo | 4 h | 33% / 67% |
| Cuidado intermediário | 6 h | 33% / 67% |
| Alta dependência | 10 h | 36% / 64% |
| Cuidado semi-intensivo | 10 h | 42% / 58% |
| Cuidado intensivo | 18 h | 52% / 48% (UTI) |

**Fórmula consolidada (anexo COFEN 543):**

```text
Quadro_total_enfermagem (FTE) =
  ( leitos_operacionais × taxa_ocupacao_alvo × HE_PD ) / CH_semanal_efetiva
  × KM (constante de Marinho) × (1 + IST)
```

Onde `KM = dias_semana_funcionamento × 7 / (dias_semana_funcionamento × CH_semanal − feriados − folgas)`. Para 36h e 7 dias, **KM ≈ 0,2089** (constante de Marinho amplamente usada).

Regras a criar (todas em `COFEN_543_2017_ENFERMAGEM`), uma por classificação SCP, usando estratégia `formula` com `expressao_calculo` legível:

```python
# RegraQuadroPessoal.expressao_calculo (DSL pretendida)
expr = "leitos_operacionais * taxa_ocupacao_alvo * he_pd * KM * (1 + ist_percentual) * proporcao_enfermeiro"
```

Variáveis injetáveis na avaliação: `leitos_operacionais`, `taxa_ocupacao_alvo`, `he_pd` (derivada de `classificacao_scp`), `KM` (constante calculada), `ist_percentual`, `proporcao_enfermeiro` / `proporcao_tecnico` (vindas da tabela acima).

> **Recomendação de implementação.** Avaliar `expressao_calculo` com a lib `asteval` (sandbox sem `__import__`, `eval`, `exec`). Validar via `ast.parse` antes. Disponibilizar variáveis no namespace e bloquear chamadas externas.

### 5.3 Bloco emergência (Portaria 2.048/2002)

A Portaria 2.048/2002 define perfis de equipe da urgência hospitalar. Resumo aplicável:

- **Sala de emergência (sala vermelha)** porte III/IV: 1 médico emergencista + 1 enfermeiro + 2 técnicos por **plantão de 12h**, mais 1 técnico de apoio por sala.
- **Acolhimento e classificação de risco**: 1 enfermeiro classificador por turno (Manchester ou similar) + 1 recepcionista por turno.
- **Sala amarela (observação curta)**: dimensionar como internação cuidado intermediário (HE_PD = 6h) sobre `leitos_observacao`.

Criar regras `PORT_2048_URGENCIA` correspondentes, condicionadas por `tipo_setor IN (emergencia_adulto, emergencia_pediatrica, acolhimento_classificacao)` e variáveis `salas_funcionamento`, `demanda_classificada_dia`.

### 5.4 Bloco UPA 24h (Portaria 104/2014, anexos do MS)

UPA porte III deve ter, por plantão de 12h:
- 2 médicos clínicos plantonistas + 1 médico pediatra plantonista
- 2 enfermeiros (1 classificador + 1 assistencial)
- 6 técnicos de enfermagem
- 1 farmacêutico (mínimo diarista) + 1 técnico de farmácia por plantão
- 1 recepcionista + 1 maqueiro por plantão

Cobrir 7 dias × 2 plantões/dia × fator 2,14 (12×36) → multiplicar quantitativos por 2,14.

### 5.5 Bloco ambulatório de especialidades

- **1 médico por consultório por turno** (`salas_funcionamento × turnos`).
- **1 enfermeiro coordenador** + **1 técnico de enfermagem por 2 consultórios em funcionamento** (estimativa SMS).
- **Recepção**: 1 a cada 4 consultórios em funcionamento.
- **Apoio multiprofissional** (psicólogo, fonoaudiólogo, assistente social, nutricionista): por especialidade ofertada — usar variável `especialidades_ofertadas` (lista) e regra `por_faixa`.

### 5.6 Bloco apoio (CME, farmácia hospitalar, administrativo) — `SMS_RIO_BASE_2026`

Estimativas internas SMS-Rio (deixar comentário "estimativa para validação"):
- CME: 1 enfermeiro coordenador 30h + 4 técnicos por turno (12×36) por 100 leitos.
- Farmácia hospitalar: 1 farmacêutico RT diarista 30h + 1 farmacêutico plantonista 12×36 por turno + 1 técnico por 50 leitos por turno.
- Administrativo: 1 recepcionista 12×36 por porta de entrada + 1 auxiliar administrativo diarista 40h por 50 leitos.

---

## 6. Tabela salarial RJ 2026 (referência)

> **Importante.** Os valores abaixo são **referências de mercado público RJ no recorte SMS-Rio**, baseados em CCT/dissídio mais recente conhecido + planos de cargos e salários públicos. Devem ser revisados pela área antes de qualquer publicação. Use-os no seed com comentário `"# valor de referência — confirmar com folha"`.

| Perfil de alocação | Salário base (R$) | Insalubridade (%) | Adic. noturno (%) | VT (qtd/dia) | VR (qtd/dia) |
|---|---|---|---|---|---|
| Médico intensivista 24×72 plantonista | 9.500 (por 24h × 4 plantões/mês ≈ R$ 8.500/24h) | 0 | 20 | 0 | 1 |
| Médico clínico/emergencista 24×72 | 8.500 | 0 | 20 | 0 | 1 |
| Médico diarista 20h (RT/coordenador) | 7.200 | 0 | 0 | 0 | 1 |
| Enfermeiro intensivista 12×36 | 4.750 (piso enfermagem L. 14.434/22) | 40 sobre mínimo | 20 | 2 | 1 |
| Enfermeiro assistencial 36h | 4.750 | 30 | 0/20 | 2 | 1 |
| Enfermeiro coordenador setor 36h | 5.700 (gratificação coord.) | 30 | 0 | 2 | 1 |
| Técnico enfermagem 12×36 | 3.325 (70% piso) | 40 sobre mínimo | 20 | 2 | 1 |
| Fisioterapeuta intensivista 12×36 | 4.200 | 30 | 20 | 2 | 1 |
| Fisioterapeuta diarista 30h | 4.000 | 30 | 0 | 2 | 1 |
| Farmacêutico RT 30h | 5.500 | 20 | 0 | 2 | 1 |
| Auxiliar administrativo 40h | 1.700 | 0 | 0 | 2 | 1 |
| Recepcionista 12×36 | 1.700 | 0 | 20 | 2 | 1 |
| Maqueiro 12×36 | 1.700 | 40 | 20 | 2 | 1 |

Insalubridade: aplicar `40%` sobre **salário mínimo nacional** (não sobre base) para enfermagem em UTI/emergência (NR-15 grau máximo); `30%` para internações comuns; `20%` para áreas administrativas com contato.

---

## 7. Catálogo de rubricas e regras de incidência

### 7.1 Grupos de rubrica
```text
PROVENTOS, BENEFICIOS, ENCARGOS_PATRONAIS, PROVISOES, CUSTOS_OPERACIONAIS
```

### 7.2 Rubricas mínimas
```text
SALARIO_BASE              — provento (base de cálculo de quase tudo)
ADIC_INSALUBRIDADE        — provento (RegraRubrica: % sobre SALARIO_MINIMO_REF)
ADIC_NOTURNO              — provento (% sobre SALARIO_BASE) — só para regimes noturnos
GRAT_RESPONSAVEL_TECNICO  — provento (valor fixo por posição)
GRAT_CHEFIA               — provento (valor fixo por posição)
TITULACAO                 — provento (valor fixo)
VALE_TRANSPORTE           — benefício (valor_por_quantidade × dias úteis)
VALE_REFEICAO             — benefício
VALE_ALIMENTACAO          — benefício
INSS_PATRONAL             — encargo (20% sobre subtotal_proventos; 0% se aplica_cebas)
SAT_RAT                   — encargo (3% sobre subtotal_proventos)
SISTEMA_S                 — encargo (5,8% sobre subtotal_proventos; isento se CEBAS)
FGTS                      — encargo (8% sobre subtotal_proventos)
PROVISAO_FERIAS           — provisão (1/12 + 1/3 sobre subtotal_proventos)
PROVISAO_13               — provisão (1/12 sobre subtotal_proventos)
ISS_RETIDO                — encargo (5% sobre receita SUS, se aplicável)
```

### 7.3 Regras de rubrica (exemplos cruciais)
- `INSS_PATRONAL`:
  - estratégia `percentual_sobre_base`, base `grupo_rubrica = PROVENTOS`, percentual `0,20`
  - **Condição**: variável `aplica_cebas == false`. Se CEBAS, criar segunda regra com percentual `0` e `prioridade` menor para sobrescrever.
- `ADIC_NOTURNO`:
  - condicionada a `regime_trabalho.codigo IN ('plantao_12x36_noturno', 'diarista_24h')`
  - 20% sobre `SALARIO_BASE`
- `ADIC_INSALUBRIDADE`:
  - base `valor_fixo` derivado da `DefinicaoVariavel.salario_minimo_referencia`
  - Faixa por tipo_setor (40% UTI/emergência; 30% internação; 20% admin)

---

## 8. Produção e custeio realista

### 8.1 Procedimentos de referência (`ProcedimentoEscopo` — escopo demo)

Para a UPA-PEN, escopo "Funcionamento mensal":
| código | nome | tipo | unidade | qtd referência (mês) | valor unit. ref. (R$) | observação |
|---|---|---|---|---|---|---|
| `0301010013` | Consulta médica em atenção especializada | assistencial | consulta | 9.000 | 10,00 | SIGTAP base SIA-SUS |
| `0301060037` | Acolhimento com classificação de risco | assistencial | atendimento | 11.000 | 4,68 | SIGTAP base SIA-SUS |
| `0303090045` | Atendimento em observação até 24h | terapeutico | observação | 1.500 | 75,00 | SIGTAP — quantidade referencial |
| `0211060011` | Eletrocardiograma | apoio_diagnostico | exame | 1.200 | 5,15 | SIGTAP |
| `0204030064` | Raio-X tórax | apoio_diagnostico | exame | 800 | 9,50 | SIGTAP |
| `IPGA` | Incentivo IPGA / IAMVI | contratual | rateio | 1 | conforme contrato | Receita complementar SMS |

Para HMSA escopo "UTI Adulto":
| código | nome | tipo | unidade | qtd referência (mês) | valor unit. ref. (R$) |
|---|---|---|---|---|---|
| `0303010134` | Tratamento em UTI Adulto tipo II — diária | terapeutico | diária | 600 (20 leitos × 30 × 0,85 ocup.) | 644,00 |
| `0303010142` | Tratamento em UTI Adulto tipo III — diária | terapeutico | diária | 300 | 800,00 |

> Valores SIGTAP **devem** ser confirmados na tabela vigente em <https://sigtap.datasus.gov.br/>. Os números acima são da banda de referência conhecida para 2024-2025; o seed deve marcar `observacoes = "valor SIGTAP de referência — confirmar versão da tabela"`.

### 8.2 Componentes de custeio (`ComponenteCusteioEscopo`) — UPA-PEN
| código | tipo | estratégia | parâmetro | valor mensal estimado |
|---|---|---|---|---|
| `MED_GERAIS` | insumo | valor_fixo_mensal | — | R$ 95.000 |
| `OPME` | insumo | valor_fixo_mensal | — | R$ 25.000 |
| `LIMPEZA_TERC` | servico_terceirizado | valor_fixo_mensal | — | R$ 180.000 |
| `SEGURANCA` | servico_terceirizado | valor_fixo_mensal | — | R$ 95.000 |
| `LAVANDERIA` | servico_terceirizado | valor_unitario × kg | 12.000 kg × R$ 4,80 | R$ 57.600 |
| `ENERGIA_AGUA` | despesa_operacional | valor_fixo_mensal | — | R$ 90.000 |
| `MANUT_PREDIAL` | despesa_operacional | valor_fixo_mensal | — | R$ 35.000 |
| `LOC_EQUIP_RX` | locacao | valor_fixo_mensal | — | R$ 38.000 |

### 8.3 Calendário operacional
- UPA / Hospitais: `dias_funcionamento_semana=7`, `semanas_funcionamento_ano=52`.
- Ambulatório especialidades: `dias_funcionamento_semana=5`, `semanas_funcionamento_ano=48` (descontar férias coletivas + recessos).

---

## 9. Cenário demonstrável a deixar pronto após `seed_plano_trabalho`

O comando deve criar **um plano completo, calculado e fechável** para a UPA da Penha (`UPA-PEN`):

1. `ObjetoPlanejamento` UPA-PEN com CNES.
2. `PlanoTrabalho` "UPA Penha — Plano 2026" com `data_referencia=2026-01-01`, `meses_projecao=12`, vinculado a `PORT_104_2014_UPA + COFEN_543 + SMS_RIO_BASE_2026`.
3. `VariantePlano`: "Sem CEBAS" (padrão) + "Com CEBAS" para comparação.
4. Estrutura: árvore com nós Acolhimento, Sala Vermelha, Sala Amarela, Pediatria UPA, Observação Adulto, Farmácia, Administrativo.
5. Escopo "Funcionamento mensal completo" agregando todos os nós.
6. Variáveis preenchidas: `leitos_operacionais=9`, `salas_funcionamento=2`, `demanda_classificada_dia=370`, `aplica_cebas=false`, `aplica_ist=true`, `ist_percentual=0,15`.
7. `ItemQuadroEscopo` populados via aplicação das regras (não digitar à mão — chamar o motor).
8. `ApuracaoPlano` do tipo `completa` rodada e `ConsolidadoResultadoMensalEscopo` populado para os 12 meses.
9. `CronogramaFinanceiro` gerado a partir da apuração com 12 parcelas mensais.

**Critério de aceite final:** abrir a UPA-PEN no front e ver, **sem nenhum clique de configuração**, o quadro completo com ~120 profissionais distribuídos, custo mensal coerente (faixa R$ 2,2–2,8 milhões/mês) e cronograma 2026 inteiro.

---

## 10. Decisões de UX que dependem do seed (atender persona da §0)

Para que essa complexidade não vaze para o usuário operacional, **o frontend e/ou backend devem oferecer**:

1. **Wizard "Configurar setor por preset normativo"**. Em "Construção do Setor", botão `+ Aplicar preset`: lista os `ConjuntoRegras` compatíveis com o `tipo_setor` do nó. Aplicar = criar `ItemQuadroEscopo` para todos os `PerfilAlocacao` exigidos pelas regras + preencher variáveis com defaults sugeridos (ex.: `taxa_ocupacao_alvo=0,85`, `ist_percentual=0,15`).
2. **Memória de cálculo por posição** (P1 do roadmap). Cada `PosicaoPlanejada` retorna ao front `{ regra: "RDC7-UTI-A-ENF-PLT", variaveis: {leitos_operacionais: 10}, formula_resolvida: "(10/8)*2,14*1,15 = 3,07 → arredonda cima → 4", referencia_fonte: "RDC ANVISA 7/2010, art. 14, III" }`. Mostrar em popover sobre o número.
3. **Simulação what-if sem persistir** (P0). Endpoint `POST /planos/<id>/simular/` que aceita override de variáveis e devolve consolidado em memória — permite o usuário arrastar slider "leitos: 8 → 12" e ver custo total mudando ao vivo.
4. **Comparador de variantes** (Sem CEBAS vs Com CEBAS) lado a lado na `apuracao.tsx`. Diferença em vermelho/verde por rubrica. CEBAS sozinho derruba ~25% do custo de pessoal — mostrar isso explícito.
5. **Checklist "para fechar o plano"** (P1) na `validacao.tsx`: contar escopos sem quadro, variáveis obrigatórias vazias por área, regras com condição não satisfeita por falta de variável, etc. Cada linha clicável leva ao ponto exato.
6. **Importação CNES → árvore** (P1). Endpoint `POST /planos/<id>/importar-cnes/<cnes>` cria `NoPlano` por unidade/setor e popula `leitos_operacionais` a partir do app `cnes/` deste repo.
7. **Catálogo SIGTAP global** (P1). `ProcedimentoEscopo.codigo` deixar de ser livre — autocomplete contra `CatalogoProcedimento` com busca por código ou nome.
8. **Linguagem de produto sempre que tocar regra**: nunca dizer "estratégia proporcional" para o usuário. Dizer **"1 enfermeiro a cada 8 leitos (RDC 7/2010, art. 14)"** com o `referencia_fonte` aparecendo como tooltip.

---

## 11. Plano de implementação sugerido para o agente que executar este prompt

Crie em ordem (cada item testável isoladamente):

1. **Migração nenhuma** — todos os models já existem. Trabalho só de seed + service.
2. `services/calculo.py` (ver §G1 da análise): funções puras `aplicar_regra_quadro`, `aplicar_regra_rubrica`, `apurar_plano(plano, tipo, persistir=True)`. Usar `asteval` para `expressao_calculo`. Snapshot do `ConjuntoRegras` em `ApuracaoPlano.metadados_json`.
3. `management/commands/seed_plano_trabalho.py`: idempotente (`get_or_create` em tudo), com flags de dry-run, plano demo opcional e validacao de cobertura. Usar transações por unidade.
4. Endpoint `POST /planos/<id>/simular/` em `views.py` chamando `apurar_plano(..., persistir=False)`.
5. Endpoint `GET /apuracoes/<id>/posicoes/<id>/explicacao/` que devolve a memória de cálculo.
6. Front: na `gestao-catalogos.tsx`, conectar o item "Aplicar preset" no menu de ações (já está como `disabled "em breve"`).
7. Front: na `construcao-setor.tsx`, adicionar bloco "Memória de cálculo" expandível por posição.
8. Front: na `apuracao.tsx`, adicionar coluna comparativa de variante.
9. Documentar no `docs/models/05-regras.md` os `expressao_calculo` permitidos e variáveis disponíveis.

**Definition of Done** do seed: ao rodar `python manage.py seed_plano_trabalho && python manage.py runserver`, abrir o front, escolher "UPA Penha 2026" e ver dashboard, estrutura, quadro, custeio mensal e cronograma todos populados sem nenhum clique.

---

## 12. Fontes normativas usadas (URLs verificadas)

- ANVISA RDC 7/2010 — UTI: <https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2010/res0007_24_02_2010.html>
- COFEN 543/2017 — Dimensionamento de Enfermagem: <https://www.cofen.gov.br/resolucao-cofen-5432017/>
- Portaria GM/MS 2.048/2002 — Urgência: <https://bvsms.saude.gov.br/bvs/saudelegis/gm/2002/prt2048_05_11_2002.html>
- Portaria GM/MS 1.631/2015 (revoga 1.101/2002) — Parâmetros assistenciais: <https://bvsms.saude.gov.br/bvs/saudelegis/gm/2015/prt1631_01_10_2015.html>
- Portaria GM/MS 104/2014 — UPAs 24h
- Lei 14.434/2022 — Piso nacional da enfermagem
- SIGTAP (tabela vigente): <https://sigtap.datasus.gov.br/>
- CNES nacional: <https://cnes.datasus.gov.br/>
- SMS-Rio — Carteira de Serviços / IPGA / IAMVI: portal SUBHUE/SMS

---

## Apêndice A — Skeleton do comando de seed

```python
# plano_trabalho/management/commands/seed_plano_trabalho.py
from django.core.management.base import BaseCommand
from django.db import transaction

class Command(BaseCommand):
    help = "Seed realista RJ: catálogos, regras (RDC/COFEN/UPA), salários, plano UPA-PEN calculado."

    def add_arguments(self, parser):
        parser.add_argument("--limpar", action="store_true")
        parser.add_argument("--sem-apuracao", action="store_true")
        parser.add_argument("--data-referencia", default="2026-01-01")

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts["limpar"]:
            self._limpar()
        self._catalogos()
        self._variaveis_e_compatibilidades()
        self._naturezas_regimes_perfis()
        self._tabela_salarial(opts["data_referencia"])
        self._conjuntos_regras()
        self._regras_quadro_uti_rdc7()
        self._regras_quadro_internacao_cofen543()
        self._regras_quadro_emergencia_2048()
        self._regras_quadro_upa_104()
        self._regras_quadro_ambulatorio()
        self._regras_quadro_apoio()
        self._rubricas_e_regras_rubrica()
        self._objetos_planejamento_rj()
        self._plano_demo_upa_penha()
        if not opts["sem_apuracao"]:
            self._apurar_e_gerar_cronograma()
        self.stdout.write(self.style.SUCCESS("Seed realista RJ concluído."))
```

Cada método privado é uma transação lógica isolada com `get_or_create` para idempotência. Use `tqdm` para progresso quando rodar regras em todos os escopos.
