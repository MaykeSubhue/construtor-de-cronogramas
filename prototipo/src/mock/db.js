// =========================================================================
// Banco de dados SIMULADO do protótipo.
// Espelha (de forma simplificada) os catálogos e estruturas descritos em
// API.md / models. Nada aqui é persistido: é só para demonstrar a UX.
// Quando integrar ao Django, troque src/mock/api.js por chamadas fetch reais
// e descarte este arquivo.
// =========================================================================

import { especialidadesCbo, unidadesMunicipais } from '../data/cadastrosMunicipais.js'
import {
  gruposRubricaOperacionais,
  rubricasOperacionais,
  servicosOperacionais,
  tiposSetorOperacionais,
} from '../data/cadastrosOperacionais.js'

// ----------------------------------------------------------------- catálogos
export const categoriasProfissionais = [
  { id: 1, nome: 'Médico', grupo: 'Saúde', conselho: 'CRM' },
  { id: 2, nome: 'Enfermeiro', grupo: 'Saúde', conselho: 'COREN' },
  { id: 3, nome: 'Técnico de Enfermagem', grupo: 'Saúde', conselho: 'COREN' },
  { id: 4, nome: 'Psicólogo', grupo: 'Saúde', conselho: 'CRP' },
  { id: 5, nome: 'Assistente Social', grupo: 'Saúde', conselho: 'CRESS' },
  { id: 6, nome: 'Técnico Administrativo', grupo: 'Administrativo', conselho: '—' },
]

export const regimesTrabalho = [
  { id: 1, nome: 'Plantonista 24h', cargaSemanal: 24, escala: '24x72' },
  { id: 2, nome: 'Plantonista 30h', cargaSemanal: 30, escala: '12x36' },
  { id: 3, nome: 'Rotina 30h', cargaSemanal: 30, escala: 'Diarista' },
  { id: 4, nome: 'Rotina 40h', cargaSemanal: 40, escala: 'Diarista' },
]

// Perfil de alocação = categoria + regime + natureza.
// Cada perfil tem um item na tabela salarial com as rubricas-base (valores mensais).
export const perfis = [
  { id: 1, label: 'Médico Psiquiatra — Plantonista 24h', categoria: 1, regime: 1,
    sal: { base: 8500, insalubridade: 1700, titulacao: 0, adicional_noturno: 850 } },
  { id: 2, label: 'Enfermeiro — Plantonista 30h', categoria: 2, regime: 2,
    sal: { base: 4500, insalubridade: 1800, titulacao: 0, adicional_noturno: 450 } },
  { id: 3, label: 'Técnico de Enfermagem — Plantonista 30h', categoria: 3, regime: 2,
    sal: { base: 1800, insalubridade: 720, titulacao: 0, adicional_noturno: 180 } },
  { id: 4, label: 'Psicólogo — Rotina 30h', categoria: 4, regime: 3,
    sal: { base: 3800, insalubridade: 760, titulacao: 0, adicional_noturno: 0 } },
  { id: 5, label: 'Assistente Social — Rotina 30h', categoria: 5, regime: 3,
    sal: { base: 3600, insalubridade: 720, titulacao: 0, adicional_noturno: 0 } },
  { id: 6, label: 'Médico Clínico — Plantonista 24h', categoria: 1, regime: 1,
    sal: { base: 8000, insalubridade: 1600, titulacao: 0, adicional_noturno: 800 } },
  { id: 7, label: 'Diretor de Unidade — Rotina 40h', categoria: 1, regime: 4,
    sal: { base: 14000, insalubridade: 0, titulacao: 2000, adicional_noturno: 0 } },
  { id: 8, label: 'Técnico Administrativo — Rotina 40h', categoria: 6, regime: 4,
    sal: { base: 2400, insalubridade: 0, titulacao: 0, adicional_noturno: 0 } },
  { id: 9, label: 'Enfermeiro Coordenador — Rotina 40h', categoria: 2, regime: 4,
    sal: { base: 6500, insalubridade: 1300, titulacao: 0, adicional_noturno: 0 } },
  // --- Perfis da UTI Adulto (salários do motor de dimensionamento SUBHUE) ---
  // adicional_noturno = 20% do salário base nos perfis noturnos.
  { id: 20, label: 'Médico Coordenador (UTI)', categoria: 1, regime: 4,
    sal: { base: 19516.67, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 21, label: 'Enfermeiro Coordenador (UTI)', categoria: 2, regime: 4,
    sal: { base: 6500, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 22, label: 'Fisioterapeuta Coordenador (UTI)', categoria: 7, regime: 4,
    sal: { base: 4555.25, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 23, label: 'Médico Plantonista Diurno (UTI)', categoria: 1, regime: 1,
    sal: { base: 6109, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 24, label: 'Médico Plantonista Noturno (UTI)', categoria: 1, regime: 1,
    sal: { base: 6109, insalubridade: 303.6, titulacao: 0, adicional_noturno: 1221.8 } },
  { id: 25, label: 'Médico Rotina (UTI)', categoria: 1, regime: 3,
    sal: { base: 15272.5, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 26, label: 'Enfermeiro Plantonista Diurno (UTI)', categoria: 2, regime: 2,
    sal: { base: 3599.31, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 27, label: 'Enfermeiro Plantonista Noturno (UTI)', categoria: 2, regime: 2,
    sal: { base: 3599.31, insalubridade: 303.6, titulacao: 0, adicional_noturno: 719.862 } },
  { id: 28, label: 'Enfermeiro Rotina (UTI)', categoria: 2, regime: 4,
    sal: { base: 4799.08, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 29, label: 'Fisioterapeuta Dia (UTI)', categoria: 7, regime: 3,
    sal: { base: 4375, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 30, label: 'Fisioterapeuta Noturno (UTI)', categoria: 7, regime: 3,
    sal: { base: 4375, insalubridade: 303.6, titulacao: 0, adicional_noturno: 875 } },
  { id: 31, label: 'Técnico de Enfermagem Diurno (UTI)', categoria: 3, regime: 2,
    sal: { base: 1666, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 32, label: 'Técnico de Enfermagem Noturno (UTI)', categoria: 3, regime: 2,
    sal: { base: 1666, insalubridade: 303.6, titulacao: 0, adicional_noturno: 333.2 } },
  { id: 33, label: 'Fonoaudiólogo (UTI)', categoria: 4, regime: 3,
    sal: { base: 4375, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 34, label: 'Psicólogo (UTI)', categoria: 4, regime: 3,
    sal: { base: 2916.67, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 35, label: 'Técnico Administrativo (UTI)', categoria: 6, regime: 4,
    sal: { base: 2000, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
  { id: 36, label: 'Médico Diarista (Clínicos)', categoria: 1, regime: 3,
    sal: { base: 11250, insalubridade: 303.6, titulacao: 0, adicional_noturno: 0 } },
]

// Gratificação (RT / chefia) por perfil — rubrica que aparece na planilha real.
const GRATIFICACAO = { 7: 0, 9: 1000, 1: 0 }

// Itens das tabelas salariais (ItemTabelaSalarial): tabela -> perfil -> rubricas.
// Tabela 1 = vigente (base dos perfis). Tabela 2 = 2025 (~5% menor). Editável no cadastro.
export const itensSalariais = {
  1: Object.fromEntries(perfis.map((p) => [p.id, {
    base: p.sal.base, insalubridade: p.sal.insalubridade, gratificacao: GRATIFICACAO[p.id] || 0,
    titulacao: p.sal.titulacao, adicional_noturno: p.sal.adicional_noturno,
  }])),
  2: Object.fromEntries(perfis.map((p) => [p.id, {
    base: Math.round(p.sal.base * 0.95 * 100) / 100, insalubridade: Math.round(p.sal.insalubridade * 0.95 * 100) / 100,
    gratificacao: Math.round((GRATIFICACAO[p.id] || 0) * 0.95 * 100) / 100,
    titulacao: Math.round(p.sal.titulacao * 0.95 * 100) / 100, adicional_noturno: Math.round(p.sal.adicional_noturno * 0.95 * 100) / 100,
  }])),
}

// Parâmetros financeiros globais do plano (ConfiguracaoGlobalPlano).
// Modelo de encargos por GRUPOS A–E, como na planilha real (não percentual único).
// O Grupo A (INSS patronal) é zerado quando o cenário tem CEBAS / imunidade tributária.
export const configGlobal = {
  encargos: {
    percentual: 0.7116, // total efetivo usado pelo motor (Sem CEBAS)
    cebas: false,       // quando true, zera o Grupo A (INSS patronal)
    breakdown: [
      { nome: 'INSS patronal', pct: 20.0 },
      { nome: 'FGTS', pct: 8.0 },
      { nome: '13º salário', pct: 8.33 },
      { nome: 'Férias + 1/3', pct: 11.11 },
      { nome: 'RAT / SAT', pct: 3.0 },
      { nome: 'Sistema S', pct: 5.8 },
      { nome: 'Multa rescisória FGTS', pct: 4.0 },
      { nome: 'Incidências s/ 13º e férias', pct: 10.92 },
    ],
  },
  beneficios: {
    vale_transporte: 242.0, // por profissional/mês
    vale_refeicao: 633.0,
  },
  apoioGestao: { cge: 0.01, rue: 0.05 }, // % sobre o RH (a1 CGE 1% + a2 RUE-OSC 5%)
  // Modelo de custo "Motor SUBHUE" (espelha o script Python): alíquota única de
  // encargos sobre o salário total + benefício fixo por funcionário/mês.
  modeloSubhue: {
    aliquotaEncargos: 0.604363, // soma das rubricas abaixo
    beneficioFunc: 212.0,       // R$/funcionário/mês (VT/VR consolidado)
    breakdown: [
      { nome: 'INSS patronal', pct: 20.0 },
      { nome: 'INSS terceiros + FAP', pct: 7.8 },
      { nome: 'PIS s/ folha', pct: 1.0 },
      { nome: 'FGTS', pct: 8.0 },
      { nome: '13º salário', pct: 8.33 },
      { nome: 'Abono de férias (1/3)', pct: 2.78 },
      { nome: 'Férias proporcionais', pct: 1.6667 },
      { nome: 'Aviso prévio indenizado', pct: 0.42 },
      { nome: 'Aviso prévio (dias extras)', pct: 0.8333 },
      { nome: 'Incidência s/ aviso', pct: 0.139 },
      { nome: 'Incidência s/ 13º férias', pct: 0.185 },
      { nome: 'Multa rescisória FGTS', pct: 4.0 },
      { nome: 'Demais incidências', pct: 5.2823 },
    ],
  },
}

// Encargos modelados por grupos (cadastro "Encargos"), espelhando a planilha.
export const encargosGrupos = [
  { grupo: 'A', nome: 'INSS Empresa', pct: 20.0, cebasIsenta: true, incidencia: 'Salário total' },
  { grupo: 'A', nome: 'INSS Terceiros + FAP', pct: 5.8, cebasIsenta: true, incidencia: 'Salário total' },
  { grupo: '—', nome: 'PIS', pct: 1.0, cebasIsenta: false, incidencia: 'Salário total' },
  { grupo: '—', nome: 'FGTS', pct: 8.0, cebasIsenta: false, incidencia: 'Salário total' },
  { grupo: 'B', nome: '13º salário', pct: 8.33, cebasIsenta: false, incidencia: 'Provisão' },
  { grupo: 'B', nome: 'Abono de férias', pct: 2.78, cebasIsenta: false, incidencia: 'Provisão' },
  { grupo: 'B', nome: 'Férias proporcionais', pct: 8.33, cebasIsenta: false, incidencia: 'Provisão' },
  { grupo: 'C', nome: 'Aviso prévio indenizado', pct: 0.42, cebasIsenta: false, incidencia: 'Provisão' },
  { grupo: 'C', nome: 'Aviso prévio (dias extras legais)', pct: 0.83, cebasIsenta: false, incidencia: 'Provisão' },
  { grupo: 'D', nome: 'Multa sobre FGTS', pct: 4.0, cebasIsenta: false, incidencia: 'FGTS' },
  { grupo: 'E', nome: 'Encargos patronais (A sobre B+C)', pct: 1.0, cebasIsenta: true, incidencia: 'A × (B+C)' },
]

// Regras de elegibilidade de benefícios (cadastro "Benefícios").
export const beneficiosRegras = [
  { id: 1, nome: 'Vale-transporte', valor_dia: 8.6, base: 'dias úteis × beneficiados',
    condicao: 'Remuneração até 4 salários mínimos', dias_uteis: 22 },
  { id: 2, nome: 'Vale-refeição / alimentação', valor_dia: 30.0, base: 'dias úteis × beneficiados',
    condicao: 'Carga horária acima de 32h', dias_uteis: 22 },
]

export const gruposRubrica = gruposRubricaOperacionais

export const rubricas = rubricasOperacionais

// =========================================================================
// NORMATIVAS / RDCs — a regra mais fundamental do processo.
// Cada normativa carrega o "modelo" (antigo preset): vínculo de setor +
// especialidade, parâmetros exigidos e o QUADRO QUE ELA PRECONIZA.
//
// DIMENSIONAMENTO (motor SUBHUE) — cada linha de quadro tem:
//   perfil  → perfil de alocação (categoria/turno/salário)
//   turno   → 'Diurno' | 'Noturno' | '—'
//   tipo    → 'por_leito' (escala com leitos) | 'fixo' (independe de leitos)
//   base    → divisor (leitos por posto) p/ por_leito; ou nº de postos p/ fixo
//   fator   → fator de cobertura (cobrir 24h/7d): qtd = ⌈ pos × fator ⌉
//   fonte   → fonte normativa da regra (mostra 'RASCUNHO' quando não validada)
// Cálculo:  pos = (tipo==='por_leito') ? ⌈ leitos / base ⌉ : base
//           qtd = ⌈ pos × fator ⌉
// `relevancia`: ordem de relevância (1 = mais relevante).
// =========================================================================
export const conjuntosRegras = [
  { id: 1, codigo: 'RDC-07', nome: 'RDC 7/2010 — UTI Adulto', orgao: 'Anvisa', vigencia: '2010-02-24', tipo: 'RDC',
    icone: '🫀', relevancia: 1, referencia: 'Art. 13 e 14 — Recursos Humanos',
    descricao: 'Requisitos mínimos de UTI Adulto. RH dimensionado por leito e por turno (Art. 14).',
    tipoSetor: 7, especialidadeId: 2,
    parametros: [
      { nome: 'Leitos operacionais', valor: 30, unidade: 'leitos', obrigatorio: true },
      { nome: 'Leitos totais', valor: 30, unidade: 'leitos', obrigatorio: true },
      { nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true },
      { nome: 'Dias de funcionamento', valor: 7, unidade: 'dias/sem', obrigatorio: true },
    ],
    quadro: [
      { perfil: 20, turno: 'Diurno',  tipo: 'fixo',      base: 1,   fator: 1,    fonte: 'RDC 7/2010 art.13' },
      { perfil: 21, turno: 'Diurno',  tipo: 'fixo',      base: 1,   fator: 1,    fonte: 'RDC 7/2010 art.13' },
      { perfil: 22, turno: 'Diurno',  tipo: 'fixo',      base: 1,   fator: 1,    fonte: 'RDC 7/2010 art.14' },
      { perfil: 23, turno: 'Diurno',  tipo: 'por_leito', base: 10,  fator: 7,    fonte: 'RDC 7/2010 (1:10/turno)' },
      { perfil: 24, turno: 'Noturno', tipo: 'por_leito', base: 10,  fator: 7,    fonte: 'RDC 7/2010 (1:10/turno)' },
      { perfil: 25, turno: 'Diurno',  tipo: 'por_leito', base: 15,  fator: 2.5,  fonte: 'RDC 7/2010' },
      { perfil: 26, turno: 'Diurno',  tipo: 'por_leito', base: 10,  fator: 3,    fonte: 'RDC 7/2010 / COFEN' },
      { perfil: 27, turno: 'Noturno', tipo: 'por_leito', base: 10,  fator: 3,    fonte: 'RDC 7/2010 / COFEN' },
      { perfil: 28, turno: 'Diurno',  tipo: 'por_leito', base: 10,  fator: 1,    fonte: 'RDC 7/2010' },
      { perfil: 29, turno: 'Diurno',  tipo: 'por_leito', base: 10,  fator: 3,    fonte: 'RDC 7/2010 (1:10)' },
      { perfil: 30, turno: 'Noturno', tipo: 'por_leito', base: 10,  fator: 3,    fonte: 'RDC 7/2010 (1:10)' },
      { perfil: 31, turno: 'Diurno',  tipo: 'por_leito', base: 2.5, fator: 3.25, fonte: 'RDC 7/2010 / COFEN (1:2)' },
      { perfil: 32, turno: 'Noturno', tipo: 'por_leito', base: 2.5, fator: 3.25, fonte: 'RDC 7/2010 / COFEN (1:2)' },
      { perfil: 33, turno: 'Diurno',  tipo: 'por_leito', base: 15,  fator: 1,    fonte: 'Equipe multi — ajustar' },
      { perfil: 34, turno: 'Diurno',  tipo: 'por_leito', base: 15,  fator: 1,    fonte: 'Equipe multi — ajustar' },
      { perfil: 35, turno: 'Diurno',  tipo: 'fixo',      base: 1,   fator: 1,    fonte: 'Apoio administrativo' },
    ],
  },
  { id: 2, codigo: 'COFEN-543', nome: 'Resolução COFEN 543/2017 — Dimensionamento de Enfermagem', orgao: 'COFEN', vigencia: '2017-05-12', tipo: 'Resolução',
    icone: '📐', relevancia: 3, referencia: 'Anexo I',
    descricao: 'Parâmetros de dimensionamento da equipe de enfermagem por leito e complexidade.',
    tipoSetor: null, especialidadeId: 6, parametros: [], quadro: [] },
  { id: 3, codigo: 'SUBHUE-RUE', nome: 'Diretriz interna SUBHUE — Rede de Urgência', orgao: 'SMS-Rio', vigencia: '2023-01-01', tipo: 'Diretriz',
    icone: '🚑', relevancia: 4, referencia: 'Diretriz institucional',
    descricao: 'Base institucional para os editais de urgência/emergência da rede SUBHUE.',
    tipoSetor: 3, especialidadeId: 2, parametros: [], quadro: [] },
  { id: 4, codigo: 'PT-3088', nome: 'Portaria 3.088 — Rede de Atenção Psicossocial', orgao: 'MS', vigencia: '2011-12-23', tipo: 'Portaria',
    icone: '🧠', relevancia: 4, referencia: 'RAPS',
    descricao: 'Diretrizes da Rede de Atenção Psicossocial — base dos leitos psiquiátricos.',
    tipoSetor: 2, especialidadeId: 1, parametros: [], quadro: [] },
  { id: 5, codigo: 'PT-930', nome: 'Portaria 930/2012 — UTI Neonatal', orgao: 'MS', vigencia: '2012-05-10', tipo: 'Portaria',
    icone: '👶', relevancia: 2, referencia: 'RH neonatal',
    descricao: 'Requisitos de funcionamento e RH das UTI Neonatais.',
    tipoSetor: 1, especialidadeId: 9,
    parametros: [
      { nome: 'Leitos operacionais', valor: 10, unidade: 'leitos', obrigatorio: true },
      { nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true },
    ],
    quadro: [
      { perfil: 6, turno: 'Diurno',  tipo: 'por_leito', base: 10, fator: 4.2, fonte: 'Portaria 930/2012' },
      { perfil: 2, turno: 'Diurno',  tipo: 'por_leito', base: 10, fator: 4.2, fonte: 'Portaria 930/2012' },
      { perfil: 3, turno: 'Diurno',  tipo: 'por_leito', base: 2,  fator: 4.2, fonte: 'Portaria 930/2012' },
    ],
  },
  // — Modelos internos (antigos presets), cada um ancorado numa normativa-base —
  { id: 6, codigo: 'MOD-PSIQ2', nome: 'Psiquiatria — 02 leitos', orgao: 'SUBHUE', vigencia: '2024-01-01', tipo: 'Modelo',
    icone: '🧠', relevancia: 5, baseNormativa: 'PT-3088', referencia: 'RAPS · Portaria 3.088',
    descricao: 'Equipe mínima para 2 leitos psiquiátricos com cobertura 24h.',
    tipoSetor: 2, especialidadeId: 1,
    parametros: [
      { nome: 'Leitos operacionais', valor: 2, unidade: 'leitos', obrigatorio: true },
      { nome: 'Leitos totais', valor: 2, unidade: 'leitos', obrigatorio: true },
      { nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true },
      { nome: 'Dias de funcionamento', valor: 7, unidade: 'dias/sem', obrigatorio: true },
    ],
    quadro: [
      { perfil: 1, turno: '—', tipo: 'fixo', base: 11, fator: 1, fonte: 'Cobertura médica psiquiátrica 24h (RAPS)' },
      { perfil: 2, turno: '—', tipo: 'fixo', base: 6,  fator: 1, fonte: 'Enfermagem assistencial 24h' },
      { perfil: 3, turno: '—', tipo: 'fixo', base: 12, fator: 1, fonte: 'Técnicos de enfermagem 24h' },
      { perfil: 4, turno: '—', tipo: 'fixo', base: 2,  fator: 1, fonte: 'Psicólogo — equipe mínima RAPS' },
      { perfil: 5, turno: '—', tipo: 'fixo', base: 1,  fator: 1, fonte: 'Assistente social — equipe mínima RAPS' },
    ],
  },
  { id: 7, codigo: 'MOD-SALAV', nome: 'Sala Amarela / Vermelha', orgao: 'SUBHUE', vigencia: '2023-01-01', tipo: 'Modelo',
    icone: '🚨', relevancia: 5, baseNormativa: 'SUBHUE-RUE', referencia: 'Diretriz SUBHUE RUE',
    descricao: 'Equipe de sala de estabilização e emergência 24h.',
    tipoSetor: 3, especialidadeId: 2,
    parametros: [
      { nome: 'Leitos de estabilização', valor: 6, unidade: 'leitos', obrigatorio: true },
      { nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true },
    ],
    quadro: [
      { perfil: 6, turno: '—', tipo: 'fixo', base: 5, fator: 1, fonte: 'Médico clínico plantonista 24h' },
      { perfil: 2, turno: '—', tipo: 'fixo', base: 5, fator: 1, fonte: 'Enfermeiro 24h' },
      { perfil: 3, turno: '—', tipo: 'fixo', base: 9, fator: 1, fonte: 'Técnico de enfermagem 24h' },
    ],
  },
  { id: 8, codigo: 'MOD-ACR', nome: 'Acolhimento e Classificação de Risco', orgao: 'SUBHUE', vigencia: '2023-01-01', tipo: 'Modelo',
    icone: '🩺', relevancia: 5, baseNormativa: 'SUBHUE-RUE', referencia: 'Diretriz SUBHUE RUE',
    descricao: 'Acolhimento com classificação de risco, fluxo 24h.',
    tipoSetor: 4, especialidadeId: 6,
    parametros: [{ nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true }],
    quadro: [
      { perfil: 2, turno: '—', tipo: 'fixo', base: 5, fator: 1, fonte: 'Enfermeiro classificador 24h' },
      { perfil: 3, turno: '—', tipo: 'fixo', base: 5, fator: 1, fonte: 'Técnico de enfermagem 24h' },
    ],
  },
  { id: 9, codigo: 'MOD-DIR', nome: 'Equipe da Direção da Unidade', orgao: 'SUBHUE', vigencia: '2023-01-01', tipo: 'Modelo',
    icone: '🏛️', relevancia: 6, baseNormativa: 'SUBHUE-RUE', referencia: 'Diretriz SUBHUE',
    descricao: 'Direção e coordenação técnica da unidade.',
    tipoSetor: 6, especialidadeId: null,
    parametros: [],
    quadro: [
      { perfil: 7, turno: '—', tipo: 'fixo', base: 1, fator: 1, fonte: 'Diretor da unidade' },
      { perfil: 9, turno: '—', tipo: 'fixo', base: 1, fator: 1, fonte: 'Enfermeiro coordenador' },
    ],
  },
  { id: 10, codigo: 'MOD-APOIO', nome: 'Apoio à Gestão', orgao: 'SUBHUE', vigencia: '2023-01-01', tipo: 'Modelo',
    icone: '🗂️', relevancia: 6, baseNormativa: 'SUBHUE-RUE', referencia: 'Diretriz SUBHUE',
    descricao: 'Equipe administrativa de apoio à gestão.',
    tipoSetor: 5, especialidadeId: null,
    parametros: [],
    quadro: [{ perfil: 8, turno: '—', tipo: 'fixo', base: 4, fator: 1, fonte: 'Apoio administrativo' }],
  },
  { id: 11, codigo: 'LEITOS-CLIN', nome: 'Leitos Clínicos — RH (rascunho)', orgao: 'SUBHUE', vigencia: '2024-01-01', tipo: 'Modelo',
    icone: '🛏️', relevancia: 5, baseNormativa: 'COFEN-543', referencia: 'COFEN 543 (a validar)',
    descricao: 'Dimensionamento de leitos clínicos — parâmetros em RASCUNHO, validar antes do uso oficial.',
    tipoSetor: 1, especialidadeId: 2,
    parametros: [
      { nome: 'Leitos operacionais', valor: 20, unidade: 'leitos', obrigatorio: true },
      { nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true },
    ],
    quadro: [
      { perfil: 9,  turno: 'Diurno',  tipo: 'fixo',      base: 1,  fator: 1,    fonte: 'RASCUNHO — validar' },
      { perfil: 26, turno: 'Diurno',  tipo: 'por_leito', base: 10, fator: 3,    fonte: 'RASCUNHO — COFEN' },
      { perfil: 27, turno: 'Noturno', tipo: 'por_leito', base: 10, fator: 3,    fonte: 'RASCUNHO — validar' },
      { perfil: 31, turno: 'Diurno',  tipo: 'por_leito', base: 6,  fator: 3.25, fonte: 'RASCUNHO — COFEN' },
      { perfil: 32, turno: 'Noturno', tipo: 'por_leito', base: 6,  fator: 3.25, fonte: 'RASCUNHO — validar' },
      { perfil: 36, turno: 'Diurno',  tipo: 'por_leito', base: 20, fator: 2.5,  fonte: 'RASCUNHO — validar' },
    ],
  },
]

// Composição = várias normativas combinadas, em ordem de aplicação (precedência).
export const composicoesNormativas = [
  { id: 1, nome: 'Base RUE Hospitalar SUBHUE 2026',
    descricao: 'Combinação usada nos editais de urgência/emergência da rede.',
    itens: [
      { conjunto_id: 3, ordem: 1 }, // Diretriz SUBHUE (base institucional)
      { conjunto_id: 1, ordem: 2 }, // RDC 7 (UTI)
      { conjunto_id: 2, ordem: 3 }, // COFEN 543 (enfermagem)
      { conjunto_id: 4, ordem: 4 }, // RAPS (psiquiatria)
    ],
  },
]

export const tabelasSalariais = [
  { id: 1, nome: 'Tabela SUBHUE 2026 — vigente', competencia: '2026-01', fonte: 'SMS-Rio' },
  { id: 2, nome: 'Tabela SUBHUE 2025', competencia: '2025-01', fonte: 'SMS-Rio' },
]

const especialidadesBase = [
  { id: 1, nome: 'Psiquiatria', tipo: 'Assistencial' },
  { id: 2, nome: 'Clínica médica', tipo: 'Assistencial' },
  { id: 3, nome: 'Pediatria', tipo: 'Assistencial' },
  { id: 4, nome: 'Ortopedia', tipo: 'Assistencial' },
  { id: 5, nome: 'Cirurgia geral', tipo: 'Assistencial' },
  { id: 6, nome: 'Enfermagem', tipo: 'Assistencial' },
  { id: 7, nome: 'Psicologia', tipo: 'Assistencial' },
  { id: 8, nome: 'Serviço social', tipo: 'Assistencial' },
  { id: 9, nome: 'Neonatologia', tipo: 'Assistencial' },
]

function chaveCadastro(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function mesclarEspecialidades(base, cbo) {
  const porNome = new Map()
  base.forEach((item) => {
    porNome.set(chaveCadastro(item.nome), { origem: 'seed', ...item })
  })
  cbo.forEach((item) => {
    const key = chaveCadastro(item.nome)
    const atual = porNome.get(key)
    if (atual) {
      porNome.set(key, {
        ...item,
        ...atual,
        tipo: atual.tipo || item.tipo,
        fonte: item.fonte || atual.fonte,
        cbos: item.cbos || atual.cbos,
        ocupacoesFonte: item.ocupacoesFonte || atual.ocupacoesFonte,
        quantidadeVinculos: item.quantidadeVinculos ?? atual.quantidadeVinculos,
        revisao: Boolean(item.revisao || atual.revisao),
      })
    } else {
      porNome.set(key, { origem: 'cbo', ...item })
    }
  })
  return [...porNome.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export const especialidades = mesclarEspecialidades(especialidadesBase, especialidadesCbo)

export const tiposSetor = tiposSetorOperacionais

// ----------------------------------------------------------------- objetos / unidades
export const objetosPlanejamento = unidadesMunicipais

// ----------------------------------------------------------------- helper de quadro
let _qid = 1
function q(perfil, qtd, origem = 'preset') {
  return { id: _qid++, perfil_alocacao_id: perfil, quantidade_planejada: qtd, origem, ativo: true }
}
function custo(nome, valor_mensal, tipo = 'servico') {
  return { id: _qid++, nome, tipo_componente: tipo, estrategia_valor: 'fixo_mensal', valor_mensal }
}

// ----------------------------------------------------------------- estrutura do plano demo
// Árvore: Unidade > setores/serviços > escopo calculável.
// Escopos folha carregam parâmetros, quadro (equipe) e custeio.
export const planos = [
  {
    id: 1,
    nome: 'Plano Assistencial CER Centro 2026',
    codigo: 'PT-2026-014',
    objeto_planejamento_id: 1,
    conjunto_regras_id: null,
    composicao_conjuntos_id: 1, // usa composição de várias normativas
    tabela_salarial_id: 1,
    competencia_inicial: '2026-01',
    meses_projecao: 12,
    status: 'em_andamento',
    descricao_recorte: 'Cobertura integral da unidade.',
    sei: { numero: 'SEI-080001/004321/2026', etapa: 'Análise técnica SUBHUE', responsavel: 'Ana Ribeiro',
           status: 'em_analise', abertura: '2026-02-10', link: '#' },
    responsavel: 'Carlos M. (SUBHUE)',
    atualizado_em: '2026-05-28',
  },
  {
    id: 2,
    nome: 'UPA Manguinhos 2026',
    codigo: 'PT-2026-021',
    objeto_planejamento_id: 2,
    conjunto_regras_id: 3,
    tabela_salarial_id: 1,
    competencia_inicial: '2026-03',
    meses_projecao: 12,
    status: 'validado',
    descricao_recorte: 'Cobertura integral da unidade.',
    sei: { numero: 'SEI-080001/005210/2026', etapa: 'Aprovado tecnicamente', responsavel: 'João P.',
           status: 'aprovado', abertura: '2026-03-04', link: '#' },
    responsavel: 'Marina S. (SUBHUE)',
    atualizado_em: '2026-05-19',
  },
  {
    id: 3,
    nome: 'Souza Aguiar — UTI Adulto (redimensionamento)',
    codigo: 'PT-2026-033',
    objeto_planejamento_id: 3,
    conjunto_regras_id: 1,
    tabela_salarial_id: 1,
    competencia_inicial: '2026-06',
    meses_projecao: 24,
    status: 'rascunho',
    descricao_recorte: 'Recorte: UTI Adulto (20 leitos).',
    sei: null,
    responsavel: 'Carlos M. (SUBHUE)',
    atualizado_em: '2026-06-01',
  },
]

// Árvore estrutural do plano 1 (CER Centro). Cada nó-folha com escopo calculável
// recebe: parametros, quadro e custeio.
export const estruturas = {
  1: [
    { id: 10, nome: 'CER Centro', tipo: 'unidade', icone: '🏥', escopo: false, children: [
      { id: 11, nome: 'Apoio à Gestão', tipo: 'setor', tipoSetor: 5, icone: '🗂️', escopo: true,
        bloco: 'Apoio à Gestão', rdcId: 10,
        parametros: [],
        quadro: [q(8, 4, 'preset')],
        custeio: [custo('Material de escritório', 3500), custo('Telefonia e internet', 2800)],
      },
      { id: 12, nome: 'Equipe da Direção da Unidade', tipo: 'setor', tipoSetor: 6, icone: '🏛️', escopo: true,
        bloco: 'Equipe da Direção da Unidade', rdcId: 9,
        parametros: [],
        quadro: [q(7, 1, 'preset'), q(9, 1, 'preset')],
        custeio: [],
      },
      { id: 13, nome: 'Sala Amarela / Vermelha', tipo: 'setor', tipoSetor: 3, icone: '🚨', escopo: false, children: [
        { id: 14, nome: 'Coordenação da Sala Amarela/Vermelha', tipo: 'servico', tipoSetor: 3, icone: '👤', escopo: true,
          bloco: 'Coordenação da Sala Amarela/Vermelha',
          parametros: [{ id: 1, nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true }],
          quadro: [q(9, 1, 'manual')],
          custeio: [],
        },
        { id: 15, nome: 'Equipe da Sala Amarela/Vermelha', tipo: 'servico', tipoSetor: 3, icone: '🚨', escopo: true,
          bloco: 'Equipe da Sala Amarela/Vermelha', rdcId: 7,
          parametros: [
            { id: 1, nome: 'Leitos de estabilização', valor: 6, unidade: 'leitos', obrigatorio: true },
            { id: 2, nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true },
          ],
          quadro: [q(6, 5, 'preset'), q(2, 5, 'preset'), q(3, 9, 'preset')],
          custeio: [custo('Insumos de emergência', 9000), custo('Gases medicinais', 4200)],
        },
      ]},
      { id: 16, nome: 'Acolhimento e Classificação de Risco', tipo: 'setor', tipoSetor: 4, icone: '🩺', escopo: true,
        bloco: 'Acolhimento e Classificação de Risco', rdcId: 8,
        parametros: [{ id: 1, nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true }],
        quadro: [q(2, 5, 'preset'), q(3, 5, 'preset')],
        custeio: [custo('Material de acolhimento', 1500)],
      },
      { id: 17, nome: 'Sala de Medicação', tipo: 'setor', tipoSetor: 3, icone: '💉', escopo: true,
        bloco: 'Sala de Medicação',
        parametros: [{ id: 1, nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true }],
        quadro: [q(2, 5, 'manual'), q(3, 9, 'manual')],
        custeio: [custo('Medicamentos e insumos', 22000)],
      },
      { id: 18, nome: 'Setor de Psiquiatria', tipo: 'setor', tipoSetor: 2, icone: '🧠', escopo: false, children: [
        { id: 19, nome: 'Leitos Psiquiátricos — 02 leitos', tipo: 'servico', tipoSetor: 2, icone: '🛏️', escopo: true,
          bloco: 'Setor de Psiquiatria', rdcId: 6, especialidade: 'Psiquiatria',
          parametros: [
            { id: 1, nome: 'Leitos operacionais', valor: 2, unidade: 'leitos', obrigatorio: true },
            { id: 2, nome: 'Leitos totais', valor: 2, unidade: 'leitos', obrigatorio: true },
            { id: 3, nome: 'Funcionamento', valor: 24, unidade: 'h/dia', obrigatorio: true },
            { id: 4, nome: 'Dias de funcionamento', valor: 7, unidade: 'dias/sem', obrigatorio: true },
            { id: 5, nome: 'Taxa de ocupação', valor: null, unidade: '%', obrigatorio: false },
          ],
          quadro: [
            q(1, 11, 'preset'), q(2, 6, 'preset'), q(3, 12, 'preset'),
            q(4, 2, 'preset'), q(5, 1, 'preset'),
          ],
          custeio: [custo('Medicamentos psiquiátricos', 6500), custo('Material assistencial', 2500)],
        },
      ]},
    ]},
  ],
}

export const statusLabels = {
  rascunho: { txt: 'Rascunho', cls: 'cinza' },
  em_andamento: { txt: 'Em construção', cls: 'azul' },
  em_revisao: { txt: 'Em revisão técnica', cls: 'roxo' },
  validado: { txt: 'Validado', cls: 'verde' },
  apurado: { txt: 'Apurado', cls: 'verde' },
  cronograma_gerado: { txt: 'Cronograma gerado', cls: 'verde' },
  enviado_sei: { txt: 'Enviado ao SEI', cls: 'azul' },
  fechado: { txt: 'Fechado', cls: 'cinza' },
  arquivado: { txt: 'Arquivado', cls: 'cinza' },
}

export const seiStatusLabels = {
  em_analise: { txt: 'Em análise', cls: 'ambar' },
  aprovado: { txt: 'Aprovado', cls: 'verde' },
  devolvido: { txt: 'Devolvido p/ ajuste', cls: 'vermelho' },
}

// ----------------------------------------------------------------- catálogos adicionais (módulos novos)

// Naturezas de atuação / turno — fundamental: define o adicional noturno.
export const naturezas = [
  { id: 1, nome: 'Rotina / Diarista', noturno: false },
  { id: 2, nome: 'Plantonista Diurno', noturno: false },
  { id: 3, nome: 'Plantonista Noturno', noturno: true },
]

// Serviços (dentro dos setores) — antes não tinham cadastro próprio.
export const servicos = servicosOperacionais

// Regras de quadro/RH — dimensionamento por estratégia (RegraQuadroPessoal).
export const regrasQuadro = [
  { id: 1, nome: 'Médico plantonista 24h por posto', normativa: 'SUBHUE-RUE', perfil: 'Médico — Plantonista', perfilId: 6,
    estrategia: 'proporcional_posto', variavel: 'leitos', fator: 4.2, minimo: 4.2, arred: 'cima' },
  { id: 2, nome: 'Enfermeiro por leito (COFEN 543)', normativa: 'COFEN-543', perfil: 'Enfermeiro', perfilId: 2,
    estrategia: 'proporcional_leito', variavel: 'leitos', fator: 0.33, minimo: 1, arred: 'cima' },
  { id: 3, nome: 'Técnico de enfermagem por leito (COFEN 543)', normativa: 'COFEN-543', perfil: 'Técnico de Enfermagem', perfilId: 3,
    estrategia: 'proporcional_leito', variavel: 'leitos', fator: 1.0, minimo: 2, arred: 'cima' },
  { id: 4, nome: 'Psicólogo mínimo por setor (RAPS)', normativa: 'PT-3088', perfil: 'Psicólogo', perfilId: 4,
    estrategia: 'quantidade_fixa', variavel: '—', fator: 1, minimo: 1, arred: '—' },
  { id: 5, nome: 'Assistente social mínimo por setor', normativa: 'PT-3088', perfil: 'Assistente Social', perfilId: 5,
    estrategia: 'quantidade_fixa', variavel: '—', fator: 1, minimo: 1, arred: '—' },
]

// Regras de custeio — geram componentes de custeio por escopo (RegraRubrica).
export const regrasCusteio = [
  { id: 1, nome: 'Apoio à gestão CGE', tipo: 'percentual', base: 'RH do plano', valor: '1%' },
  { id: 2, nome: 'Apoio à gestão RUE-OSC', tipo: 'percentual', base: 'RH do plano', valor: '5%' },
  { id: 3, nome: 'Medicamentos por leito/mês', tipo: 'unitario', base: 'leitos', valor: 'R$ 3.250 / leito' },
  { id: 4, nome: 'Gases medicinais (UTI)', tipo: 'fixo_mensal', base: '—', valor: 'R$ 4.200 / mês' },
]

// Variáveis obrigatórias por tipo de setor (CompatibilidadeTipoSetorVariavel).
export const variaveisObrigatorias = [
  { tipoSetor: 'Leitos psiquiátricos', variaveis: ['Leitos operacionais', 'Leitos totais', 'Funcionamento', 'Dias de funcionamento'] },
  { tipoSetor: 'Leitos clínicos', variaveis: ['Leitos operacionais', 'Leitos totais', 'Taxa de ocupação', 'Permanência média'] },
  { tipoSetor: 'Sala de urgência', variaveis: ['Leitos de estabilização', 'Funcionamento'] },
  { tipoSetor: 'Acolhimento / classificação', variaveis: ['Funcionamento', 'Salas'] },
  { tipoSetor: 'Apoio / administrativo', variaveis: [] },
  { tipoSetor: 'Direção', variaveis: [] },
  { tipoSetor: 'UTI Adulto', variaveis: ['Leitos operacionais', 'Leitos totais', 'Funcionamento', 'Dias de funcionamento'] },
]

export const lancamentosCronograma = {}
