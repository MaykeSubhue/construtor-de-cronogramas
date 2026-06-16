// =========================================================================
// "API" simulada + motor de cálculo do protótipo.
// As funções são síncronas para simplificar a UX do protótipo. Na integração
// real, cada função vira um fetch para /plano-trabalho/api/... (ver API.md):
//   getBootstrap()        -> GET /bootstrap/
//   listPlanos()          -> GET /planos/
//   getEstrutura(id)      -> GET /planos/{id}/estrutura/
//   getNo(id, noId)       -> GET /planos/{id}/estrutura/nos/{no}/configuracao/
//   getCronograma(id)     -> POST /planos/{id}/cronogramas/gerar/ + GET
//   getCompletude(id)     -> GET /planos/{id}/checklist-completude/
// O motor de cálculo aqui é a contraparte de services/calculo.py.
// =========================================================================
import * as seedDb from './db.js'
import { initStore, persistStore } from './store.js'
import { matrizHospitalar, setoresMatriz } from '../data/matrizHospitalar.js'
import { cadastroMunicipalMeta } from '../data/cadastrosMunicipais.js'
import { baseSalarialRh, baseSalarialRhMeta } from '../data/baseSalarialRh.js'
import {
  fontesNormativasMetodologicas,
  regrasNormativasMetodologicas,
  referenciasCronogramaAtuais,
} from '../data/regrasNormativasMetodologicas.js'
import { gerarCronogramaFinanceiro } from './cronograma.js'
import {
  defaultChs,
  parametrosParaRegras,
  perfilMatriz,
  prescricaoMatriz,
  regrasPorSetor,
  setorMatrizPorSlug,
  slug,
} from './calculo.js'
import { sugerirSetorPorTexto } from './parser.js'
import { gerarCompetencias } from '../lib/format.js'

const db = initStore(seedDb)
const persist = () => persistStore(db)

// Proxy dinâmico: reflete perfis adicionados em runtime (cadastro de perfis).
const perfilById = new Proxy({}, { get: (_t, k) => db.perfis.find((p) => String(p.id) === String(k)) || perfilMatriz(k) })

const SETOR_DEFAULTS = {
  'enfermaria-clinica-adulto': { quantidade: 30, unidade: 'leitos' },
  'enfermaria-cirurgica': { quantidade: 30, unidade: 'leitos' },
  'enfermaria-obstetrica-puerperio': { quantidade: 30, unidade: 'leitos' },
  'enfermaria-pediatrica': { quantidade: 20, unidade: 'leitos' },
  'leitos-de-isolamento': { quantidade: 4, unidade: 'leitos' },
  'sala-vermelha-estabilizacao': { quantidade: 6, unidade: 'leitos' },
  'observacao-adulto': { quantidade: 12, unidade: 'leitos' },
  'observacao-pediatrica': { quantidade: 6, unidade: 'leitos' },
  'centro-cirurgico': { quantidade: 4, unidade: 'salas' },
  rpa: { quantidade: 6, unidade: 'leitos' },
  'uti-adulto': { quantidade: 10, unidade: 'leitos' },
  'uti-neonatal': { quantidade: 10, unidade: 'leitos' },
  'uti-pediatrica': { quantidade: 10, unidade: 'leitos' },
  'consultorios-de-emergencia': { quantidade: 4, unidade: 'consultórios' },
  'centro-obstetrico': { quantidade: 4, unidade: 'salas' },
}

const HOSPITAL_TEMPLATES = [
  {
    id: 'hospital-geral-emergencia',
    nome: 'Hospital geral com emergência',
    descricao: 'Estrutura inicial para hospital geral com porta de entrada e internação clínica.',
    setores: [
      'hospital-geral',
      'ccih-scih',
      'nucleo-de-seguranca-do-paciente',
      'farmacia-hospitalar',
      'servico-de-nutricao-e-dietetica',
      'areas-assistenciais',
      'pgrss',
      'hospital-24h',
      'suporte-local',
      'transporte-interno',
      'classificacao-de-risco',
      'consultorios-de-emergencia',
      'sala-de-medicacao',
      'sala-vermelha-estabilizacao',
      'observacao-adulto',
      'enfermaria-clinica-adulto',
      'leitos-de-isolamento',
    ].map((slug) => ({ slug, obrigatorio: true })),
  },
  {
    id: 'upa-cer',
    nome: 'UPA / CER',
    descricao: 'Estrutura enxuta para porta de urgência, observação e apoio assistencial.',
    setores: [
      { slug: 'classificacao-de-risco', obrigatorio: true },
      { slug: 'consultorios-de-emergencia', obrigatorio: true },
      { slug: 'sala-de-medicacao', obrigatorio: true },
      { slug: 'sala-vermelha-estabilizacao', obrigatorio: true },
      { slug: 'observacao-adulto', obrigatorio: true },
      { slug: 'observacao-pediatrica', obrigatorio: false },
      { slug: 'farmacia-satelite', obrigatorio: true },
      { slug: 'areas-assistenciais', obrigatorio: true },
      { slug: 'transporte-interno', obrigatorio: true },
    ],
  },
  {
    id: 'maternidade',
    nome: 'Maternidade',
    descricao: 'Estrutura inicial materno-infantil com centro obstétrico, internação e apoios.',
    setores: [
      { slug: 'centro-obstetrico', obrigatorio: true },
      { slug: 'enfermaria-obstetrica-puerperio', obrigatorio: true },
      { slug: 'enfermaria-pediatrica', obrigatorio: true },
      { slug: 'uti-neonatal', obrigatorio: false },
      { slug: 'servico-de-nutricao-e-dietetica', obrigatorio: true },
      { slug: 'farmacia-hospitalar', obrigatorio: true },
      { slug: 'central-de-material-e-esterilizacao', obrigatorio: true },
      { slug: 'areas-assistenciais', obrigatorio: true },
    ],
  },
]

// ----------------------------------------------------------- catálogos / refs
export const getBootstrap = () => ({
  objetos_planejamento: db.objetosPlanejamento,
  conjuntos_regras: db.conjuntosRegras,
  tabelas_salariais: db.tabelasSalariais,
  tipos_setor: db.tiposSetor,
  modelos: listModelos(),
  matriz: {
    versao: matrizHospitalar.versao,
    setores: setoresMatriz,
    regras: matrizHospitalar.regrasRh.length,
  },
})

export const getPerfil = (id) => perfilById[id]
export const getObjeto = (id) => db.objetosPlanejamento.find((o) => o.id === id)
export const getConjunto = (id) => db.conjuntosRegras.find((c) => c.id === id)
export const getTabela = (id) => db.tabelasSalariais.find((t) => t.id === id)
export const getComposicao = (id) => db.composicoesNormativas.find((c) => c.id === id)
export const getEspecialidade = (id) => db.especialidades.find((e) => e.id === id)

// ----------------------------------------------------------- normativas / RDCs (unificadas)
export const getRDC = (id) => {
  if (String(id).startsWith('matriz:')) {
    const setorSlug = String(id).replace('matriz:', '')
    const setor = setorMatrizPorSlug(setorSlug)
    const regras = regrasPorSetor(setorSlug)
    return {
      id,
      codigo: 'MATRIZ-V4',
      nome: setor?.setor || 'Matriz técnica v4',
      orgao: 'Matriz validada RJ',
      tipo: 'Matriz técnica',
      referencia: [...new Set(regras.map((r) => r.fonte).filter(Boolean))].slice(0, 3).join(' · '),
      descricao: setor?.observacaoImplantacao || 'Fonte canônica do MVP para dimensionamento normativo.',
      parametros: [],
      quadro: [],
      matrizSetorSlug: setorSlug,
    }
  }
  return db.conjuntosRegras.find((c) => String(c.id) === String(id))
}
// "Modelos" = normativas que carregam um quadro preconizado (aplicáveis a um setor).
export const listModelos = () => db.conjuntosRegras.filter((c) => c.quadro && c.quadro.length)
// Normativas/RDCs compatíveis com um tipo de setor (para auto-carregar na construção).
export function modelosParaSetor(tipoSetorId) {
  const todos = listModelos()
  if (tipoSetorId == null) return todos
  const compat = todos.filter((c) => c.tipoSetor === Number(tipoSetorId))
  return compat.length ? compat : todos
}

export const matrizSetores = setoresMatriz
export const sugerirCriacaoPorTexto = (texto) => sugerirSetorPorTexto(texto)
export const perfisHospitalares = HOSPITAL_TEMPLATES

const FONTE_MATRIZ_V4 = {
  id: 'matriz-v4-rio-validada',
  titulo: 'Matriz tecnica v4 Rio validada',
  orgao: 'Matriz validada RJ',
  ano: 2026,
  tipoFonte: 'Matriz tecnica',
  esfera: 'Matriz validada Rio',
  arquivo: 'matriz_tecnica_parametros_hospitalares_v4_rio_validada.xlsx',
  usoNoMvp: 'Fonte canonica calculavel para dimensionamento normativo de RH.',
  statusFonte: 'calculavel',
}

export const fontesRegrasNormativas = [FONTE_MATRIZ_V4, ...fontesNormativasMetodologicas]
export const referenciasCronograma = referenciasCronogramaAtuais

const fonteRegrasById = new Map(fontesRegrasNormativas.map((fonte) => [fonte.id, fonte]))

function formulaRegraMatriz(regra) {
  const partes = [regra.tipoCalculo || 'calculo_matriz']
  if (regra.base != null) partes.push(`base ${regra.base}`)
  if (regra.qtdPorBase != null) partes.push(`qtd/base ${regra.qtdPorBase}`)
  if (regra.horas != null) partes.push(`${regra.horas}h`)
  if (regra.diasSemana != null) partes.push(`${regra.diasSemana} dias/semana`)
  if (regra.ist != null) partes.push(`IST ${Number(regra.ist)}`)
  return partes.join(' | ')
}

function enriquecerRegra(regra) {
  const fonte = fonteRegrasById.get(regra.fonteId)
  const fontesComplementares = (regra.fonteComplementarIds || []).map((id) => fonteRegrasById.get(id)).filter(Boolean)
  return {
    ...regra,
    fonte,
    fontesComplementares,
    origem: regra.origem || 'biblioteca',
  }
}

function normalizarRegraMatriz(regra) {
  const fonte = fonteRegrasById.get(FONTE_MATRIZ_V4.id)
  return {
    id: `matriz-${regra.id}`,
    titulo: `${regra.setor} - ${regra.funcao}`,
    fonteId: FONTE_MATRIZ_V4.id,
    fonte,
    tipoRegra: 'rh_normativo',
    status: 'calculavel',
    origem: 'matriz',
    setor: regra.setor,
    setorSlug: regra.setorSlug,
    setorSlugs: [regra.setorSlug].filter(Boolean),
    aliases: [regra.setor, regra.funcao, regra.categoria].filter(Boolean),
    parametroDimensionador: regra.metrica || 'Parametro da matriz',
    formula: formulaRegraMatriz(regra),
    categoriaProfissional: regra.categoria || regra.funcao,
    regimeTurno: regra.natureza || `${regra.turnosDia || 1} turno(s)`,
    memoriaCalculo: {
      entrada: regra.metrica || regra.metricaSlug || 'Parametro do setor',
      logica: regra.tipoCalculo || 'Conforme matriz tecnica v4',
      evidencia: regra.fonte || 'Matriz tecnica v4',
      observacao: regra.observacaoTecnica || '',
    },
    validadeTerritorial: regra.aplicabilidadeRio || regra.observacaoTerritorial || 'Aplicavel no Municipio do Rio, sujeito a validacao territorial local.',
    fonteNormativaTexto: regra.fonte,
    url: regra.url,
    esferaNormativa: regra.esferaNorma,
    revisaoLocal: regra.revisarLocal,
    matrizRegra: regra,
  }
}

export const regrasNormativas = [
  ...matrizHospitalar.regrasRh.map(normalizarRegraMatriz),
  ...regrasNormativasMetodologicas.map(enriquecerRegra),
]

function textoRegra(regra) {
  return slug([
    regra.titulo,
    regra.setor,
    regra.parametroDimensionador,
    regra.formula,
    regra.categoriaProfissional,
    regra.regimeTurno,
    regra.fonte?.titulo,
    regra.fonte?.orgao,
    regra.fonteNormativaTexto,
    ...(regra.aliases || []),
  ].filter(Boolean).join(' '))
}

export function listRegrasNormativas(filtro = {}) {
  const busca = slug(filtro.busca || '')
  return regrasNormativas.filter((regra) => {
    if (filtro.status && regra.status !== filtro.status) return false
    if (filtro.tipoRegra && regra.tipoRegra !== filtro.tipoRegra) return false
    if (filtro.fonteId && regra.fonteId !== filtro.fonteId) return false
    if (busca && !textoRegra(regra).includes(busca)) return false
    return true
  })
}

export function resumoRegrasNormativas() {
  const total = regrasNormativas.length
  return {
    total,
    calculavel: regrasNormativas.filter((regra) => regra.status === 'calculavel').length,
    referencial: regrasNormativas.filter((regra) => regra.status === 'referencial').length,
    revisar: regrasNormativas.filter((regra) => regra.status === 'revisar').length,
    matriz: regrasNormativas.filter((regra) => regra.origem === 'matriz').length,
    biblioteca: regrasNormativas.filter((regra) => regra.origem !== 'matriz').length,
    fontes: fontesRegrasNormativas.length,
    referenciasCronograma: referenciasCronograma.length,
  }
}

function regraAplicaAoNo(regra, no = {}) {
  if (regra.aplicacaoGeral === 'financeira_contextual') return false

  const setorSlug = no.matrizSetorSlug || slug(no.nome || no.bloco || '')
  const textoNo = slug([no.nome, no.bloco, no.especialidade, no.matrizSetorSlug, no.tipo, no.tipoSetor].filter(Boolean).join(' '))
  const slugs = regra.setorSlugs || (regra.setorSlug ? [regra.setorSlug] : [])

  if (setorSlug && slugs.includes(setorSlug)) return true
  if (slugs.some((item) => item && textoNo.includes(item))) return true
  if ((regra.aliases || []).some((alias) => {
    const termo = slug(alias)
    return termo && textoNo.includes(termo)
  })) return true

  if (regra.aplicacaoGeral === 'administrativa') return /gestao|direcao|diretor|administrativo|apoio|suporte|manutencao|ti/.test(textoNo)
  if (regra.aplicacaoGeral === 'responsabilidade_tecnica') return /uti|cti|centro-cirurgico|queimados|hospital|direcao-medica|responsavel-tecnico|crm/.test(textoNo)
  if (regra.aplicacaoGeral === 'saude') return no.escopo !== false && !/gestao|direcao|administrativo/.test(textoNo)
  return false
}

export function regrasAplicaveisAoSetor(no = {}) {
  const rankStatus = { calculavel: 0, revisar: 1, referencial: 2 }
  const rankOrigem = { matriz: 0, biblioteca: 1 }
  const mapa = new Map()
  regrasNormativas.forEach((regra) => {
    if (regraAplicaAoNo(regra, no)) mapa.set(regra.id, regra)
  })
  return [...mapa.values()].sort((a, b) =>
    (rankStatus[a.status] ?? 9) - (rankStatus[b.status] ?? 9) ||
    (rankOrigem[a.origem] ?? 9) - (rankOrigem[b.origem] ?? 9) ||
    String(a.titulo).localeCompare(String(b.titulo), 'pt-BR')
  )
}

export function setoresDoPerfilHospitalar(templateId) {
  const template = HOSPITAL_TEMPLATES.find((item) => item.id === templateId) || HOSPITAL_TEMPLATES[0]
  return template.setores.map((item) => {
    const setor = setorMatrizPorSlug(item.slug)
    const defaults = SETOR_DEFAULTS[item.slug] || { quantidade: 1, unidade: 'unidade' }
    return {
      ...item,
      ativo: item.ativo !== false,
      quantidade: item.quantidade ?? defaults.quantidade,
      unidade: item.unidade || defaults.unidade,
      justificativa: '',
      setor,
    }
  })
}

function previewSetorMatriz(setorSlug, quantidade = 1, unidade = 'unidade') {
  const setor = setorMatrizPorSlug(setorSlug)
  const regras = regrasPorSetor(setorSlug)
  const parametros = parametrosParaRegras(regras, quantidade, unidade)
  const noPreview = { matrizSetorSlug: setorSlug, parametros, quadro: [] }
  const prescricoes = prescricaoMatriz(noPreview)
  const fontes = [...new Set(prescricoes.map((p) => p.fonte).filter(Boolean))]
  const equipeTotal = prescricoes.reduce((acc, item) => acc + (Number(item.qtd) || 0), 0)
  const qp30Total = prescricoes.reduce((acc, item) => acc + (Number(item.qp30) || 0), 0)
  const qp40Total = prescricoes.reduce((acc, item) => acc + (Number(item.qp40) || 0), 0)

  return {
    setorSlug,
    setor,
    quantidade,
    unidade,
    parametros,
    regras: prescricoes,
    fontes,
    equipeTotal,
    qp30Total,
    qp40Total,
    aviso: prescricoes.length ? '' : 'Setor sem regra de RH estruturada na matriz validada.',
  }
}

export function previewSetorPorTexto(texto) {
  const sugestao = sugerirSetorPorTexto(texto)
  if (!sugestao.setorSlug) {
    return {
      ...sugestao,
      preview: null,
      equipeTotal: 0,
      qp30Total: 0,
      qp40Total: 0,
      linhas: [],
    }
  }
  const preview = previewSetorMatriz(sugestao.setorSlug, sugestao.quantidade, sugestao.unidade)
  return {
    ...sugestao,
    preview,
    parametros: preview.parametros,
    fontes: preview.fontes,
    equipeTotal: preview.equipeTotal,
    qp30Total: preview.qp30Total,
    qp40Total: preview.qp40Total,
    linhas: preview.regras,
  }
}

export function previewPlanoNormativo(payload = {}) {
  const modo = payload.modo || 'setor'
  const unidade = payload.unidade?.tipo === 'nova'
    ? { nome: payload.unidade.nome || 'Nova unidade', tipo: payload.unidade.tipoUnidade || 'Hospital geral', cnes: payload.unidade.cnes || '', nova: true }
    : getObjeto(payload.unidade?.id || payload.objeto_planejamento_id)

  if (modo === 'setor') {
    const setor = previewSetorPorTexto(payload.setorTexto || '')
    return {
      modo,
      unidade,
      setores: setor.setorSlug ? [{ ...setor, ativo: true, obrigatorio: true, justificativa: '' }] : [],
      resumo: {
        setoresAtivos: setor.setorSlug ? 1 : 0,
        equipeTotal: setor.equipeTotal || 0,
        qp30Total: setor.qp30Total || 0,
        qp40Total: setor.qp40Total || 0,
      },
      avisos: setor.aviso ? [setor.aviso] : [],
    }
  }

  const template = HOSPITAL_TEMPLATES.find((item) => item.id === payload.templateId) || HOSPITAL_TEMPLATES[0]
  const setoresPayload = payload.setores?.length ? payload.setores : setoresDoPerfilHospitalar(template.id)
  const setores = setoresPayload.map((item) => {
    const defaults = SETOR_DEFAULTS[item.slug] || { quantidade: 1, unidade: 'unidade' }
    const preview = previewSetorMatriz(item.slug, item.quantidade ?? defaults.quantidade, item.unidade || defaults.unidade)
    return {
      ...item,
      ...preview,
      ativo: item.ativo !== false,
      obrigatorio: item.obrigatorio !== false,
      justificativa: item.justificativa || '',
      setor: preview.setor,
      linhas: preview.regras,
    }
  })
  const ativos = setores.filter((item) => item.ativo)
  return {
    modo,
    unidade,
    template,
    setores,
    resumo: {
      setoresAtivos: ativos.length,
      setoresTotal: setores.length,
      equipeTotal: ativos.reduce((acc, item) => acc + item.equipeTotal, 0),
      qp30Total: ativos.reduce((acc, item) => acc + item.qp30Total, 0),
      qp40Total: ativos.reduce((acc, item) => acc + item.qp40Total, 0),
    },
    avisos: setores.filter((item) => item.ativo && item.aviso).map((item) => `${item.setor?.setor || item.slug}: ${item.aviso}`),
  }
}

// Motor de dimensionamento (espelha o motor SUBHUE em Python):
//   pos = (tipo==='por_leito') ? ⌈ leitos / base ⌉ : base
//   qtd = ⌈ pos × fator ⌉
// Compatível com o formato antigo (regra.estrategia) e com quadro fixo (qtd).
function dimensionar(item, no) {
  if (item.tipo) {
    const leitos = paramValor(no, ['leitos operacionais', 'leitos de estabilização', 'leitos']) || 0
    const pos = item.tipo === 'por_leito' ? Math.ceil(leitos / (item.base || 1)) : (item.base || 0)
    return { pos, qtd: Math.ceil(pos * (item.fator ?? 1)) }
  }
  const r = item.regra
  if (r && r.estrategia) {
    const leitos = paramValor(no, ['leitos operacionais', 'leitos de estabilização', 'leitos'])
    let q = 0
    if (r.estrategia === 'quantidade_fixa') q = r.fator || r.minimo || 0
    else if (leitos != null && leitos > 0) {
      if (r.estrategia === 'proporcional_leito') q = leitos * r.fator
      else if (r.estrategia === 'proporcional_posto') q = r.fator
      else q = r.minimo || 0
      q = Math.max(q, r.minimo || 0)
    } else q = r.minimo || 0
    return { pos: null, qtd: Math.ceil(q) }
  }
  return { pos: null, qtd: Math.round(item.qtd ?? 0) }
}
function qtdPrescrita(item, no) { return dimensionar(item, no).qtd }

// Prescrição da RDC para o nó: lista detalhada por perfil/turno.
export function prescricaoRDC(no) {
  if (no?.matrizSetorSlug) return prescricaoMatriz(no)
  const rdc = no && no.rdcId != null ? getRDC(no.rdcId) : null
  if (!rdc || !rdc.quadro) return []
  return rdc.quadro.map((item) => {
    const dim = dimensionar(item, no)
    const fonte = item.fonte || item.regra?.texto || ''
    return {
      perfilId: item.perfil,
      perfil: perfilById[item.perfil],
      qtd: dim.qtd,
      pos: dim.pos,
      turno: item.turno || '—',
      tipo: item.tipo || (item.regra ? 'regra' : 'fixo'),
      base: item.base,
      fator: item.fator,
      fonte,
      texto: fonte,
      rascunho: /rascunho/i.test(fonte),
    }
  })
}

// O nó usa alguma regra ainda em RASCUNHO? (alerta na construção)
export function temRascunho(no) {
  return prescricaoRDC(no).some((p) => p.rascunho)
}

// Conformidade do nó com a RDC: compara o quadro atual com o preconizado.
// desvios: { perfilId, perfil, previsto, atual, tipo: 'alterado'|'removido'|'adicionado', justificativa }
export function conformidadeRDC(planoId, no) {
  const rdc = no && no.rdcId != null ? getRDC(no.rdcId) : null
  if (!rdc) return { rdc: null, previsto: [], desvios: [] }
  const previsto = prescricaoRDC(no)
  const justificativas = no.desvios || {}
  const atualPorPerfil = {}
  ;(no.quadro || []).filter((q) => q.ativo !== false).forEach((q) => {
    atualPorPerfil[q.perfil_alocacao_id] = (atualPorPerfil[q.perfil_alocacao_id] || 0) + (Number(q.quantidade_planejada) || 0)
  })
  const desvios = []
  previsto.forEach((p) => {
    const atual = atualPorPerfil[p.perfilId] ?? 0
    if (atual !== p.qtd) {
      desvios.push({ perfilId: p.perfilId, perfil: p.perfil, previsto: p.qtd, atual,
        tipo: atual === 0 ? 'removido' : 'alterado', texto: p.texto, justificativa: justificativas[p.perfilId]?.motivo || null })
    }
  })
  const previstoIds = new Set(previsto.map((p) => p.perfilId))
  Object.keys(atualPorPerfil).forEach((pid) => {
    if (!previstoIds.has(pid) && !previstoIds.has(Number(pid))) {
      desvios.push({ perfilId: pid, perfil: perfilById[pid], previsto: 0, atual: atualPorPerfil[pid],
        tipo: 'adicionado', texto: 'Profissional não previsto pela RDC deste setor', justificativa: justificativas[pid]?.motivo || null })
    }
  })
  return { rdc, previsto, desvios }
}

// Registra a justificativa de um desvio (à revelia do que a RDC preconiza).
export function registrarJustificativa(planoId, alvo = {}, dados = {}) {
  const plano = db.planos.find((p) => p.id === Number(planoId))
  if (!plano) return null
  const registro = {
    id: ++_novoId,
    quando: new Date().toISOString(),
    quem: 'Usuário',
    alvo,
    tipo: dados.tipo || alvo.tipo || 'ajuste',
    motivo: dados.motivo || dados.justificativa || '',
    de: dados.de,
    para: dados.para,
    observacao: dados.observacao || '',
  }
  plano.justificativas = plano.justificativas || []
  plano.justificativas.push(registro)
  if (alvo.noId != null) {
    const no = findNo(planoId, alvo.noId)
    if (no) {
      no.justificativas = no.justificativas || []
      no.justificativas.push(registro)
    }
  }
  persist()
  return registro
}

export function registrarDesvio(planoId, noId, perfilId, dados) {
  const no = findNo(planoId, noId)
  if (!no) return
  no.desvios = no.desvios || {}
  no.desvios[perfilId] = { ...dados, quando: '2026-06-03', quem: 'Carlos M.' }
  const item = (no.quadro || []).find((q) => String(q.perfil_alocacao_id) === String(perfilId))
  if (item) item.overrideJustificado = true
  registrarJustificativa(planoId, { tipo: 'rh', noId, perfilId }, { ...dados, tipo: dados.tipo || 'desvio_rh' })
  persist()
}
export function limparDesvio(planoId, noId, perfilId) {
  const no = findNo(planoId, noId)
  if (no && no.desvios) delete no.desvios[perfilId]
  const item = (no?.quadro || []).find((q) => String(q.perfil_alocacao_id) === String(perfilId))
  if (item) item.overrideJustificado = false
  persist()
}

// Resolve as normativas efetivas de um plano (composição em ordem OU conjunto único).
export function getBasesPlano(plano) {
  if (plano.composicao_conjuntos_id) {
    const comp = getComposicao(plano.composicao_conjuntos_id)
    if (comp) {
      return {
        modo: 'composicao',
        nome: comp.nome,
        conjuntos: comp.itens
          .slice()
          .sort((a, b) => a.ordem - b.ordem)
          .map((it) => ({ ordem: it.ordem, conjunto: getConjunto(it.conjunto_id) })),
      }
    }
  }
  const c = getConjunto(plano.conjunto_regras_id)
  return { modo: 'unico', nome: c?.nome, conjuntos: c ? [{ ordem: 1, conjunto: c }] : [] }
}

// ----------------------------------------------------------- motor de cálculo (RH)
// Percentual de encargos derivado dos grupos A–E. Com CEBAS (imunidade
// tributária), os itens marcados como isentos (INSS patronal etc.) saem da conta.
export function encargosPercentual(cebas = false) {
  return db.encargosGrupos
    .filter((g) => !(cebas && g.cebasIsenta))
    .reduce((a, g) => a + g.pct, 0) / 100
}

// Item salarial efetivo do perfil na tabela escolhida (default = tabela vigente, id 1).
export function salItem(perfilId, tabelaId = 1) {
  const perfil = perfilById[perfilId]
  return (db.itensSalariais[tabelaId] && db.itensSalariais[tabelaId][perfilId]) || perfil?.sal || { base: 0, insalubridade: 0, gratificacao: 0, titulacao: 0, adicional_noturno: 0 }
}

// Replica salário base + adicionais -> encargos -> benefícios -> custo.
// modelo: 'grupos' (encargos por grupos A–E + CEBAS, VT+VR) ou
//         'subhue' (alíquota única ≈ 60,44% + benefício fixo R$/func — motor Python).
export function calcPerfil(perfilId, opts = {}) {
  const { cebas = false, tabelaId = 1, modelo = 'grupos' } = opts
  const perfil = perfilById[perfilId]
  const s = salItem(perfilId, tabelaId)
  const salario_total = s.base + s.insalubridade + (s.gratificacao || 0) + s.titulacao + s.adicional_noturno
  let encargos_pct, beneficios
  if (modelo === 'subhue') {
    encargos_pct = db.configGlobal.modeloSubhue.aliquotaEncargos
    beneficios = db.configGlobal.modeloSubhue.beneficioFunc
  } else {
    encargos_pct = encargosPercentual(cebas)
    beneficios = db.configGlobal.beneficios.vale_transporte + db.configGlobal.beneficios.vale_refeicao
  }
  const referenciaSalarial = s.referenciaSalarial || perfil?.referenciaSalarial
  const encargos = salario_total * encargos_pct
  const custo_unitario = salario_total + encargos + beneficios
  return {
    ...s,
    salario_total,
    encargos_pct,
    encargos,
    beneficios,
    custo_unitario,
    cebas,
    modelo,
    referenciaSalarial,
    salarioProvisorio: !!s.provisorio || (!!perfil?.matriz && !!referenciaSalarial?.fallbackSalarial),
  }
}

export function calcItemQuadro(item, opts = {}) {
  const p = perfilById[item.perfil_alocacao_id]
  const c = calcPerfil(item.perfil_alocacao_id, opts)
  const qtd = Number(item.quantidade_planejada) || 0
  return {
    ...item,
    perfil: p,
    ...c,
    quantidade: qtd,
    quantidade_normativa: item.quantidade_normativa,
    qp40: item.qp40,
    qp30: item.qp30,
    chs: item.chs,
    memoriaCalculo: item.memoriaCalculo,
    overrideJustificado: item.overrideJustificado,
    custo_total: c.custo_unitario * qtd,
  }
}

// Custo de um escopo (nó-folha): RH + custeio.
function sincronizarQuadroMatriz(no) {
  if (!no?.matrizSetorSlug) return
  const prescricoes = prescricaoMatriz(no)
  no.quadro = no.quadro || []
  prescricoes.forEach((p) => {
    let item = no.quadro.find((q) => String(q.perfil_alocacao_id) === String(p.perfilId))
    if (!item) {
      item = {
        id: ++_novoId,
        perfil_alocacao_id: p.perfilId,
        quantidade_planejada: p.qtd,
        origem: 'matriz',
        ativo: true,
      }
      no.quadro.push(item)
    }
    item.matrizRegraId = p.regra.id
    item.quantidade_normativa = p.qtd
    item.qp40 = p.qp40
    item.qp30 = p.qp30
    item.chs = p.chs
    if (!item.overrideJustificado && !(no.desvios || {})[p.perfilId]?.motivo) {
      item.quantidade_planejada = p.qtd
      item.origem = 'matriz'
    }
    item.memoriaCalculo = {
      ...p.memoriaCalculo,
      quantidadeNormativa: p.qtd,
      quantidadeEscolhida: item.quantidade_planejada,
    }
  })
}

export function calcEscopo(no, opts = {}) {
  sincronizarQuadroMatriz(no)
  const itens = (no.quadro || []).filter((i) => i.ativo !== false).map((i) => calcItemQuadro(i, opts))
  const rh_total = itens.reduce((a, i) => a + i.custo_total, 0)
  const equipe_total = itens.reduce((a, i) => a + i.quantidade, 0)
  const custeio_total = (no.custeio || []).reduce((a, c) => a + (c.valor_mensal || 0), 0)
  return {
    itens,
    equipe_total,
    rh_total,
    custeio_total,
    total_mensal: rh_total + custeio_total,
    total_anual: (rh_total + custeio_total) * 12,
  }
}

// ----------------------------------------------------------- estrutura / nós
// Garante um array de estrutura mutável por plano (inclusive planos "em branco").
export function getEstrutura(planoId) {
  if (!db.estruturas[planoId]) db.estruturas[planoId] = []
  return db.estruturas[planoId]
}

function walk(nodes, fn, parent = null) {
  for (const n of nodes) {
    fn(n, parent)
    if (n.children) walk(n.children, fn, n)
  }
}

export function findNo(planoId, noId) {
  let found = null
  walk(getEstrutura(planoId), (n) => { if (n.id === noId) found = n })
  return found
}

// Lista de escopos calculáveis (folhas com escopo=true).
export function listEscopos(planoId) {
  const out = []
  walk(getEstrutura(planoId), (n) => { if (n.escopo) out.push(n) })
  return out
}

// Pendências por escopo (contraparte de completude.py).
export function pendenciasDoNo(no) {
  const pend = []
  if (no.escopo) {
    const obrig = (no.parametros || []).filter((p) => p.obrigatorio)
    const faltando = obrig.filter((p) => p.valor == null || p.valor === '')
    faltando.forEach((p) => pend.push({ tipo: 'parametro', msg: `Parâmetro "${p.nome}" não preenchido` }))
    if ((no.quadro || []).filter((q) => q.ativo !== false).length === 0)
      pend.push({ tipo: 'equipe', msg: 'Setor sem equipe definida' })
  }
  return pend
}

// ----------------------------------------------------------- planos
export const listPlanos = () =>
  db.planos.map((p) => {
    const escopos = listEscopos(p.id)
    const total = escopos.reduce((a, n) => a + calcEscopo(n).total_mensal, 0)
    return {
      ...p,
      objeto: getObjeto(p.objeto_planejamento_id),
      valor_mensal: total,
      valor_anual: total * 12,
    }
  })

export const getPlano = (id) => listPlanos().find((p) => p.id === Number(id))

function unidadeDoPayload(payload) {
  if (payload.unidade?.tipo === 'nova') {
    return addCadastro('unidades', {
      nome: payload.unidade.nome || 'Nova unidade',
      sigla: payload.unidade.sigla || slug(payload.unidade.nome || 'nova-unidade').slice(0, 18).toUpperCase(),
      cnes: payload.unidade.cnes || '',
      tipo: payload.unidade.tipoUnidade || 'Hospital geral',
      ap: 'Não informada',
      ativo: true,
      fonte: 'Cadastro manual',
    })
  }
  return getObjeto(payload.unidade?.id || payload.objeto_planejamento_id) || db.objetosPlanejamento[0]
}

function codigoPlano(id) {
  const ano = new Date().getFullYear()
  return `PT-${ano}-${String(id).padStart(3, '0')}`
}

function criarNoAgrupador(nome, tipo = 'setor', extra = {}) {
  return {
    id: ++_novoId,
    nome,
    tipo,
    icone: tipo === 'unidade' ? '🏥' : '📂',
    escopo: false,
    children: [],
    ...extra,
  }
}

function materializarSetorNormativo(planoId, paiId, setorPreview, meta = {}) {
  const no = addNo(planoId, {
    nome: setorPreview.setor?.setor || setorPreview.setor?.nome || setorPreview.setorSlug,
    paiId,
    calculavel: true,
    matrizSetorSlug: setorPreview.setorSlug,
    parametros: setorPreview.parametros,
    rdcId: setorPreview.setorSlug ? `matriz:${setorPreview.setorSlug}` : null,
  })
  Object.assign(no, {
    origemCriacao: meta.origemCriacao || 'normativo',
    origemTemplate: meta.templateId || null,
    templateObrigatorio: meta.obrigatorio ?? true,
    templateJustificativa: meta.justificativa || '',
  })
  return no
}

export function criarPlanoNormativo(payload = {}) {
  const preview = previewPlanoNormativo(payload)
  const unidade = unidadeDoPayload(payload)
  const id = nextId(db.planos)
  const nomePadrao = payload.modo === 'setor'
    ? `Cronograma ${preview.setores[0]?.setor?.setor || 'Setor'} - ${unidade.nome}`
    : `Cronograma ${preview.template?.nome || 'Hospital'} - ${unidade.nome}`
  const plano = {
    id,
    nome: payload.nome?.trim() || nomePadrao,
    codigo: codigoPlano(id),
    objeto_planejamento_id: unidade.id,
    conjunto_regras_id: null,
    composicao_conjuntos_id: 1,
    tabela_salarial_id: Number(payload.tabela_salarial_id || payload.tabelaSalarialId || 1),
    competencia_inicial: payload.competencia_inicial || '2026-01',
    meses_projecao: Number(payload.meses_projecao || 12),
    status: 'rascunho',
    descricao_recorte: payload.modo === 'setor' ? 'Recorte normativo por setor.' : `Perfil hospitalar: ${preview.template?.nome || 'Hospital/unidade completa'}.`,
    sei: payload.sei ? { numero: payload.sei, etapa: 'Abertura', responsavel: '', status: 'em_analise', abertura: new Date().toISOString().slice(0, 10), link: '#' } : null,
    responsavel: 'Usuário',
    atualizado_em: new Date().toISOString().slice(0, 10),
    origemCriacao: 'wizard_normativo',
    modoCriacao: payload.modo || 'setor',
    templateHospitalarId: preview.template?.id || null,
    justificativas: [],
  }
  db.planos.push(plano)

  const raiz = criarNoAgrupador(unidade.nome, 'unidade', { objeto_planejamento_id: unidade.id })
  db.estruturas[id] = [raiz]

  if ((payload.modo || 'setor') === 'setor') {
    const setor = preview.setores[0]
    if (setor?.setorSlug) {
      materializarSetorNormativo(id, raiz.id, setor, { origemCriacao: 'setor_texto', obrigatorio: true })
    } else {
      const manual = addNo(id, { nome: payload.setorTexto || 'Setor manual', paiId: raiz.id, calculavel: true })
      manual.foraMatriz = true
      manual.origemCriacao = 'manual_sem_regra'
      registrarJustificativa(id, { tipo: 'setor_manual', noId: manual.id }, { motivo: 'Setor criado sem regra estruturada na matriz validada.', tipo: 'setor_manual' })
    }
  } else {
    const grupos = new Map()
    preview.setores.forEach((setor) => {
      if (!setor.ativo) {
        if (setor.obrigatorio) {
          registrarJustificativa(id, { tipo: 'setor_template_removido', setorSlug: setor.setorSlug }, {
            motivo: setor.justificativa,
            tipo: 'setor_template_removido',
            observacao: `${setor.setor?.setor || setor.setorSlug} removido da criação inicial.`,
          })
        }
        return
      }
      const macro = setor.setor?.macroarea || 'Estrutura'
      if (!grupos.has(macro)) {
        const grupo = criarNoAgrupador(macro)
        raiz.children.push(grupo)
        grupos.set(macro, grupo)
      }
      materializarSetorNormativo(id, grupos.get(macro).id, setor, {
        origemCriacao: 'template_hospitalar',
        templateId: preview.template?.id,
        obrigatorio: setor.obrigatorio,
        justificativa: setor.justificativa,
      })
    })
  }

  persist()
  return plano
}

// ----------------------------------------------------------- completude
export function getCompletude(planoId) {
  const escopos = listEscopos(planoId)
  const linhas = escopos.map((no) => {
    const obrig = (no.parametros || []).filter((p) => p.obrigatorio)
    const preench = obrig.filter((p) => p.valor != null && p.valor !== '')
    const semEquipe = (no.quadro || []).filter((q) => q.ativo !== false).length === 0
    return {
      no,
      exigidas: obrig.length,
      preenchidas: preench.length,
      faltantes: obrig.length - preench.length,
      semEquipe,
      pendencias: pendenciasDoNo(no),
    }
  })
  const total_exigidas = linhas.reduce((a, l) => a + l.exigidas, 0)
  const total_preenchidas = linhas.reduce((a, l) => a + l.preenchidas, 0)
  const completos = linhas.filter((l) => l.faltantes === 0 && !l.semEquipe).length
  return {
    resumo: {
      total_exigidas,
      total_preenchidas,
      total_faltantes: total_exigidas - total_preenchidas,
      percentual: total_exigidas ? Math.round((total_preenchidas / total_exigidas) * 100) : 100,
      escopos_completos: completos,
      escopos_total: linhas.length,
    },
    linhas,
  }
}

// ----------------------------------------------------------- cronograma financeiro
// Agrupa escopos por "bloco", separa Parte Fixa (RH) de Custeio e distribui
// linearmente nos meses do plano. NÃO recalcula regra: usa o custo já apurado.
export function getCronograma(planoId, opts = {}) {
  return gerarCronogramaFinanceiro({
    plano: getPlano(planoId),
    escopos: listEscopos(planoId),
    calcEscopo,
    configGlobal: db.configGlobal,
    gerarCompetencias,
    opts,
  })

  // cebas: cenário com imunidade tributária; reajuste: fator salarial do TA;
  // meses/competenciaInicial/mesInicialNum: janela e numeração (Termo Aditivo = 25..48).
  const { cebas = false, reajuste = 0, modelo = 'grupos' } = opts
  const plano = getPlano(planoId)
  const nMeses = opts.meses || plano.meses_projecao
  const compIni = opts.competenciaInicial || plano.competencia_inicial
  const mesInicialNum = opts.mesInicialNum || 1
  const fator = 1 + reajuste
  const meses = gerarCompetencias(compIni, nMeses)

  // agrupa por bloco
  const blocosMap = new Map()
  for (const no of listEscopos(planoId)) {
    const calc = calcEscopo(no, { cebas, modelo })
    const nome = no.bloco || no.nome
    if (!blocosMap.has(nome)) blocosMap.set(nome, { nome, rh: 0, custeio: 0, itens: [], custeioItens: [] })
    const b = blocosMap.get(nome)
    b.rh += calc.rh_total * fator
    b.custeio += calc.custeio_total * fator
    calc.itens.forEach((i) => b.itens.push({ label: i.perfil.label, mensal: i.custo_total * fator }))
    ;(no.custeio || []).forEach((c) => b.custeioItens.push({ label: c.nome, mensal: c.valor_mensal * fator }))
  }
  const blocos = [...blocosMap.values()]

  const rhMensal = blocos.reduce((a, b) => a + b.rh, 0)
  const custeioMensal = blocos.reduce((a, b) => a + b.custeio, 0)
  // Apoio à Gestão = taxa CGE + RUE-OSC sobre o RH (como na planilha real).
  const ag = db.configGlobal.apoioGestao
  const apoioMensal = rhMensal * (ag.cge + ag.rue)
  const parteFixaMensal = rhMensal + apoioMensal
  const parteVariavelMensal = 0 // produção — sem componentes variáveis neste plano
  const totalMensal = parteFixaMensal + custeioMensal + parteVariavelMensal

  const espalhar = (mensal) => meses.map(() => mensal)

  return {
    plano,
    meses,
    mesInicialNum,
    cebas,
    reajuste,
    blocos: blocos.map((b) => ({
      ...b,
      total_mensal: b.rh,
      valores: espalhar(b.rh),
      total_periodo: b.rh * meses.length,
    })),
    apoioGestao: {
      mensal: apoioMensal,
      valores: espalhar(apoioMensal),
      total_periodo: apoioMensal * meses.length,
      itens: [
        { label: `Apoio à gestão CGE (${(ag.cge * 100).toFixed(0)}%)`, mensal: rhMensal * ag.cge },
        { label: `Apoio à gestão RUE-OSC (${(ag.rue * 100).toFixed(0)}%)`, mensal: rhMensal * ag.rue },
      ],
    },
    custeio: {
      mensal: custeioMensal,
      valores: espalhar(custeioMensal),
      total_periodo: custeioMensal * meses.length,
      itens: blocos.flatMap((b) => b.custeioItens),
    },
    parteFixa: { mensal: parteFixaMensal, valores: espalhar(parteFixaMensal), total_periodo: parteFixaMensal * meses.length },
    parteVariavel: { mensal: parteVariavelMensal, valores: espalhar(parteVariavelMensal), total_periodo: 0 },
    total: { mensal: totalMensal, valores: espalhar(totalMensal), total_periodo: totalMensal * meses.length },
  }
}

// ----------------------------------------------------------- dashboard
export function getDashboard() {
  const planos = listPlanos()
  const valorEmAnalise = planos
    .filter((p) => p.sei && p.sei.status === 'em_analise')
    .reduce((a, p) => a + p.valor_anual, 0)
  return {
    total: planos.length,
    em_andamento: planos.filter((p) => p.status === 'em_andamento').length,
    validados: planos.filter((p) => p.status === 'validado').length,
    com_pendencia: planos.filter((p) => getCompletude(p.id).resumo.total_faltantes > 0).length,
    enviados_sei: planos.filter((p) => p.sei).length,
    valor_em_analise: valorEmAnalise,
    recentes: planos.slice().sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em)),
  }
}

// ----------------------------------------------------------- mutações (em memória)
let _novoId = 9000

// Lista plana dos nós (para escolher o pai ao criar um nó).
export function listNos(planoId) {
  const out = []
  walk(getEstrutura(planoId), (n, pai) => out.push({ id: n.id, nome: n.nome, escopo: n.escopo, paiId: pai?.id || null }))
  return out
}

const ICONES_TIPO = {
  'Leitos psiquiátricos': '🧠', 'Leitos clínicos': '🛏️', 'Sala de urgência': '🚨',
  'Acolhimento / classificação': '🩺', 'Apoio / administrativo': '🗂️', 'Direção': '🏛️',
  'UTI Adulto': '🫀',
}

// Cria um setor/serviço novo. Se for calculável, já traz as variáveis obrigatórias
// daquele tipo de setor (guia o preenchimento, como na construção do zero).
export function addNo(planoId, { nome, paiId = null, tipoSetorId = null, calculavel = true, rdcId = null, especialidadeId = null, matrizSetorSlug = null, parametros = null }) {
  const tipo = db.tiposSetor.find((t) => t.id === tipoSetorId)
  const obrig = tipo ? (db.variaveisObrigatorias.find((v) => v.tipoSetor === tipo.nome)?.variaveis || []) : []
  const esp = especialidadeId != null ? getEspecialidade(Number(especialidadeId)) : null
  const novo = {
    id: ++_novoId,
    nome,
    tipo: paiId ? 'servico' : 'setor',
    tipoSetor: tipoSetorId,
    especialidade: esp?.nome,
    icone: (tipo && ICONES_TIPO[tipo.nome]) || (calculavel ? '🔧' : '📂'),
    escopo: calculavel,
    bloco: nome,
    matrizSetorSlug,
    parametros: parametros || (calculavel ? obrig.map((nm, i) => ({ id: i + 1, nome: nm, valor: null, unidade: '', obrigatorio: true })) : []),
    quadro: [],
    custeio: [],
  }
  if (!calculavel) novo.children = []
  if (paiId) {
    const pai = findNo(planoId, paiId)
    pai.children = pai.children || []
    pai.children.push(novo)
  } else {
    getEstrutura(planoId).push(novo)
  }
  // Auto-carrega a RDC/normativa: o setor já nasce com os parâmetros e o
  // quadro preconizado pela norma (pode ser ajustado depois, com justificativa).
  if (calculavel && rdcId != null && !matrizSetorSlug) aplicarRDC(planoId, novo.id, rdcId)
  if (calculavel && matrizSetorSlug) aplicarMatrizSetor(planoId, novo.id, matrizSetorSlug)
  persist()
  return novo
}

export function addNoPorTexto(planoId, texto, extras = {}) {
  const sugestao = sugerirCriacaoPorTexto(texto)
  const nome = extras.nome || sugestao.setor?.setor || texto
  return addNo(planoId, {
    nome,
    paiId: extras.paiId ?? null,
    calculavel: true,
    matrizSetorSlug: sugestao.setorSlug,
    parametros: sugestao.parametros,
    rdcId: sugestao.setorSlug ? `matriz:${sugestao.setorSlug}` : null,
  })
}

export function removeNo(planoId, noId) {
  const prune = (arr) => {
    const i = arr.findIndex((n) => n.id === noId)
    if (i >= 0) { arr.splice(i, 1); return true }
    return arr.some((n) => n.children && prune(n.children))
  }
  prune(getEstrutura(planoId))
  persist()
}

export function addProfissional(planoId, noId, perfilId, qtd) {
  const no = findNo(planoId, noId)
  no.quadro = no.quadro || []
  const item = { id: ++_novoId, perfil_alocacao_id: Number(perfilId), quantidade_planejada: Math.max(0, Math.round(qtd)), origem: 'manual', ativo: true }
  no.quadro.push(item)
  persist()
  return item
}

export function removeProfissional(planoId, noId, itemId) {
  const no = findNo(planoId, noId)
  no.quadro = (no.quadro || []).filter((i) => i.id !== itemId)
  persist()
}

export function addCusteio(planoId, noId, nome, valor) {
  const no = findNo(planoId, noId)
  no.custeio = no.custeio || []
  no.custeio.push({ id: ++_novoId, nome, tipo_componente: 'servico', estrategia_valor: 'fixo_mensal', valor_mensal: Number(valor) || 0 })
  persist()
}

export function removeCusteio(planoId, noId, itemId) {
  const no = findNo(planoId, noId)
  no.custeio = (no.custeio || []).filter((c) => c.id !== itemId)
  persist()
}

// ---- Regras de quadro: dimensiona a equipe a partir dos parâmetros (leitos)
function paramValor(no, chaves) {
  const p = (no.parametros || []).find((x) => chaves.some((k) => x.nome.toLowerCase().includes(k)))
  return p && p.valor != null ? Number(p.valor) : null
}

export function sugestoesQuadro(planoId, noId) {
  const no = findNo(planoId, noId)
  const leitos = paramValor(no, ['leitos operacionais', 'leitos de estabilização', 'leitos'])
  return db.regrasQuadro
    .map((r) => {
      let qtd = 0
      if (r.estrategia === 'quantidade_fixa') qtd = r.fator || r.minimo || 0
      else if (r.variavel === 'leitos' && leitos != null && leitos > 0) {
        if (r.estrategia === 'proporcional_leito') qtd = leitos * r.fator
        else if (r.estrategia === 'proporcional_posto') qtd = r.fator
        else if (r.estrategia === 'por_faixa') qtd = r.minimo
        qtd = Math.max(qtd, r.minimo || 0)
      }
      qtd = Math.ceil(qtd) // profissionais são números inteiros
      return { regra: r, perfil: perfilById[r.perfilId], qtd }
    })
    .filter((s) => s.qtd > 0 && s.perfil)
}

export function materializarQuadro(planoId, noId, sugestoes) {
  const no = findNo(planoId, noId)
  no.quadro = no.quadro || []
  sugestoes.forEach((s) => no.quadro.push({
    id: ++_novoId, perfil_alocacao_id: s.perfil.id, quantidade_planejada: s.qtd, origem: 'regra', ativo: true,
  }))
  persist()
}

// ---- Produção (metas físicas)
export function addProducao(planoId, noId, nome, meta, unidade) {
  const no = findNo(planoId, noId)
  no.producao = no.producao || []
  no.producao.push({ id: ++_novoId, nome, meta: Number(meta) || 0, unidade })
  persist()
}
export function removeProducao(planoId, noId, itemId) {
  const no = findNo(planoId, noId)
  no.producao = (no.producao || []).filter((p) => p.id !== itemId)
  persist()
}

// ---- Ações de nó
export function renomearNo(planoId, noId, nome) {
  const no = findNo(planoId, noId)
  if (no) { no.nome = nome; no.bloco = nome }
  persist()
}
export function duplicarNo(planoId, noId) {
  const orig = findNo(planoId, noId)
  if (!orig) return null
  const clone = JSON.parse(JSON.stringify(orig))
  const reid = (n) => { n.id = ++_novoId; (n.children || []).forEach(reid); (n.quadro || []).forEach((q) => (q.id = ++_novoId)) }
  reid(clone)
  clone.nome = `${orig.nome} (cópia)`
  clone.bloco = clone.nome
  // insere como irmão
  const findParentArr = (arr) => {
    if (arr.some((n) => n.id === noId)) return arr
    for (const n of arr) { if (n.children) { const r = findParentArr(n.children); if (r) return r } }
    return null
  }
  const arr = findParentArr(getEstrutura(planoId))
  if (arr) arr.push(clone)
  persist()
  return clone
}

// ---- Normativas / RDCs (criar/editar) — unifica RDC + modelo (preset)
export function salvarRDC(rdc) {
  const existe = rdc.id != null && db.conjuntosRegras.find((c) => c.id === rdc.id)
  if (existe) {
    Object.assign(existe, rdc)
    persist()
    return existe
  }
  const id = Math.max(0, ...db.conjuntosRegras.map((c) => c.id || 0)) + 1
  const novo = { id, relevancia: 5, ...rdc }
  db.conjuntosRegras.push(novo)
  persist()
  return novo
}
// alias retrocompatível
export const salvarPreset = (rdc) => salvarRDC(rdc)

// ---- Cadastro inline de setor / especialidade (a partir da tela da RDC)
export function addEspecialidade(nome, tipo = 'Assistencial') {
  const id = Math.max(0, ...db.especialidades.map((e) => e.id)) + 1
  const nova = { id, nome, tipo, origem: 'manual', fonte: 'Cadastro manual' }
  db.especialidades.push(nova)
  persist()
  return nova
}
export function addTipoSetor(nome, calculavel = true) {
  const id = Math.max(0, ...db.tiposSetor.map((t) => t.id)) + 1
  const novo = { id, nome, calculavel, origem: 'manual' }
  db.tiposSetor.push(novo)
  persist()
  return novo
}

function nextId(arr) {
  return Math.max(0, ...(arr || []).map((item) => Number(item.id) || 0)) + 1
}

function catalogoArray(secao) {
  return ({
    unidades: db.objetosPlanejamento,
    especialidades: db.especialidades,
    setores: db.tiposSetor,
    rubricas: db.rubricas,
    categorias: db.categoriasProfissionais,
    regimes: db.regimesTrabalho,
    naturezas: db.naturezas,
    servicos: db.servicos,
    encargos: db.encargosGrupos,
    beneficios: db.beneficiosRegras,
    'regras-custeio': db.regrasCusteio,
  })[secao]
}

export function addCadastro(secao, dados = {}) {
  if (secao === 'perfis') return addPerfilAlocacao(dados)
  const arr = catalogoArray(secao)
  if (!arr) return null
  const novo = { origem: 'manual', ...dados, id: nextId(arr) }
  if (secao === 'unidades') {
    novo.ativo = dados.ativo ?? true
    novo.fonte = dados.fonte || 'Cadastro manual'
  }
  if (secao === 'especialidades') novo.fonte = dados.fonte || 'Cadastro manual'
  arr.push(novo)
  persist()
  return novo
}

export function addPerfilAlocacao(dados = {}) {
  const id = nextId(db.perfis)
  const sal = {
    base: Number(dados.base || 0),
    insalubridade: Number(dados.insalubridade || 0),
    titulacao: Number(dados.titulacao || 0),
    adicional_noturno: Number(dados.adicional_noturno || 0),
  }
  const novo = { id, label: dados.label || `Perfil ${id}`, categoria: null, regime: null, sal, origem: 'manual' }
  db.perfis.push(novo)
  Object.keys(db.itensSalariais).forEach((tabelaId) => {
    db.itensSalariais[tabelaId][id] = { ...sal, gratificacao: Number(dados.gratificacao || 0) }
  })
  persist()
  return novo
}

export function upsertVariaveisObrigatorias(tipoSetor, variaveis) {
  const limpas = (variaveis || []).map((v) => String(v).trim()).filter(Boolean)
  const existente = db.variaveisObrigatorias.find((v) => v.tipoSetor === tipoSetor)
  if (existente) existente.variaveis = limpas
  else db.variaveisObrigatorias.push({ tipoSetor, variaveis: limpas })
  persist()
}

export function addComposicaoNormativa({ nome, descricao, itens }) {
  const id = nextId(db.composicoesNormativas)
  const nova = { id, nome, descricao, itens: (itens || []).map((cid, idx) => ({ conjunto_id: cid, ordem: idx + 1 })) }
  db.composicoesNormativas.push(nova)
  persist()
  return nova
}

export function addRegraQuadro(dados) {
  const id = nextId(db.regrasQuadro)
  const perfil = db.perfis.find((p) => p.id === Number(dados.perfilId))
  const nova = {
    id,
    nome: dados.nome,
    normativa: dados.normativa,
    perfil: perfil?.label,
    perfilId: Number(dados.perfilId),
    estrategia: dados.estrategia,
    variavel: dados.estrategia === 'quantidade_fixa' ? '---' : dados.variavel,
    fator: Number(dados.fator),
    minimo: Number(dados.minimo),
    arred: dados.arred,
  }
  db.regrasQuadro.push(nova)
  persist()
  return nova
}

// ---- Tabelas salariais (criar + editar itens)
export function setSalarioItem(tabelaId, perfilId, campo, valor) {
  if (!db.itensSalariais[tabelaId]) db.itensSalariais[tabelaId] = {}
  if (!db.itensSalariais[tabelaId][perfilId]) db.itensSalariais[tabelaId][perfilId] = { base: 0, insalubridade: 0, gratificacao: 0, titulacao: 0, adicional_noturno: 0 }
  db.itensSalariais[tabelaId][perfilId][campo] = Math.max(0, Number(valor) || 0)
  persist()
}
export function addTabelaSalarial({ nome, competencia, fonte, baseTabelaId = 1 }) {
  const id = Math.max(0, ...db.tabelasSalariais.map((t) => t.id)) + 1
  db.tabelasSalariais.push({ id, nome, competencia, fonte })
  db.itensSalariais[id] = JSON.parse(JSON.stringify(db.itensSalariais[baseTabelaId] || {}))
  persist()
  return id
}

// ---- Ciclo de vida do plano + SEI
export function setStatusPlano(planoId, status) {
  const p = db.planos.find((x) => x.id === planoId)
  if (p) { p.status = status; p.atualizado_em = '2026-06-02' }
  persist()
}
export function vincularSei(planoId, dados) {
  const p = db.planos.find((x) => x.id === planoId)
  if (!p) return
  p.sei = { ...(p.sei || { etapa: '', responsavel: '', status: 'em_analise', abertura: '2026-06-02', link: '#' }), ...dados }
  persist()
}
export function duplicarPlano(planoId) {
  const orig = db.planos.find((x) => x.id === planoId)
  if (!orig) return null
  const novoId = Math.max(...db.planos.map((p) => p.id)) + 1
  const clone = { ...orig, id: novoId, nome: `${orig.nome} (cópia)`, codigo: `${orig.codigo}-C`, status: 'rascunho', sei: null, atualizado_em: '2026-06-02' }
  db.planos.push(clone)
  db.estruturas[novoId] = JSON.parse(JSON.stringify(getEstrutura(planoId)))
  let nid = 50000
  walk(db.estruturas[novoId], (n) => { n.id = ++nid; (n.quadro || []).forEach((q) => (q.id = ++nid)) })
  persist()
  return clone
}

export function setQuantidade(planoId, noId, itemId, qtd) {
  const no = findNo(planoId, noId)
  const item = (no.quadro || []).find((i) => i.id === itemId)
  if (item) {
    item.quantidade_planejada = Math.max(0, Math.round(Number(qtd) || 0))
    item.origem = 'manual'
    item.overrideJustificado = item.quantidade_normativa != null && item.quantidade_planejada !== item.quantidade_normativa
  }
  persist()
}

export function setParametro(planoId, noId, paramId, valor) {
  const no = findNo(planoId, noId)
  const p = (no.parametros || []).find((x) => x.id === paramId)
  if (p) {
    const anterior = p.valor
    const novo = valor === '' ? null : Number(valor)
    p.valor = novo
    if (anterior !== novo) {
      no.historicoParametros = no.historicoParametros || []
      no.historicoParametros.push({
        id: ++_novoId,
        quando: new Date().toISOString(),
        quem: 'Usuário',
        parametroId: p.id,
        parametro: p.nome,
        de: anterior,
        para: novo,
        observacao: 'Alteração de parâmetro dimensionador; equipe recalculada pela matriz normativa.',
      })
    }
  }
  sincronizarQuadroMatriz(no)
  persist()
}

export function setChsMatriz(planoId, noId, perfilId, chs) {
  const no = findNo(planoId, noId)
  const item = (no?.quadro || []).find((q) => String(q.perfil_alocacao_id) === String(perfilId))
  if (!no || !item?.matrizRegraId) return
  no.chsPorRegra = no.chsPorRegra || {}
  no.chsPorRegra[item.matrizRegraId] = Number(chs)
  item.overrideJustificado = false
  if (no.desvios) delete no.desvios[perfilId]
  sincronizarQuadroMatriz(no)
  persist()
}

// Aplica uma RDC/normativa a um nó: carrega parâmetros e o quadro PRECONIZADO.
// O quadro vem com origem 'rdc' e o nó passa a referenciar a RDC (no.rdcId),
// permitindo checagem de conformidade e alertas de desvio na construção.
export function aplicarRDC(planoId, noId, rdcId) {
  if (String(rdcId).startsWith('matriz:')) {
    return aplicarMatrizSetor(planoId, noId, String(rdcId).replace('matriz:', ''))
  }
  const no = findNo(planoId, noId)
  const rdc = getRDC(rdcId)
  if (!no || !rdc) return
  // primeiro os parâmetros (para que o dimensionamento por leito use os valores da RDC)
  no.parametros = (rdc.parametros || []).map((p, i) => ({
    id: i + 1, nome: p.nome, valor: p.valor, unidade: p.unidade, obrigatorio: p.obrigatorio !== false,
  }))
  no.rdcId = rdc.id
  no.desvios = {}
  let nid = Date.now()
  const prescr = prescricaoRDC(no)
  no.quadro = prescr.map((p) => ({
    id: nid++, perfil_alocacao_id: p.perfilId, quantidade_planejada: p.qtd, origem: 'rdc', ativo: true,
  }))
  persist()
}

export function aplicarMatrizSetor(planoId, noId, setorSlug) {
  const no = findNo(planoId, noId)
  if (!no || !setorSlug) return no
  const regras = regrasPorSetor(setorSlug)
  const setor = setorMatrizPorSlug(setorSlug)
  const quantidade = Number((no.parametros || []).find((p) => slug(p.nome).includes('leito') || slug(p.nome).includes('sala'))?.valor) || 1
  no.matrizSetorSlug = setorSlug
  no.rdcId = `matriz:${setorSlug}`
  no.desvios = {}
  if (!no.parametros?.length) no.parametros = parametrosParaRegras(regras, quantidade)
  no.nome = no.nome || setor?.setor
  no.bloco = no.bloco || no.nome
  no.quadro = []
  prescricaoMatriz(no).forEach((p) => {
    no.quadro.push({
      id: ++_novoId,
      perfil_alocacao_id: p.perfilId,
      quantidade_planejada: p.qtd,
      quantidade_normativa: p.qtd,
      qp40: p.qp40,
      qp30: p.qp30,
      chs: p.chs,
      matrizRegraId: p.regra.id,
      memoriaCalculo: p.memoriaCalculo,
      origem: 'matriz',
      ativo: true,
    })
  })
  persist()
  return no
}
// alias retrocompatível
export const aplicarPreset = (planoId, noId, id) => aplicarRDC(planoId, noId, id)

export const configGlobal = db.configGlobal
export const statusLabels = db.statusLabels
export const seiStatusLabels = db.seiStatusLabels
export const cadastroMunicipal = cadastroMunicipalMeta
export const baseSalarialRhInfo = baseSalarialRhMeta
export const baseSalarialRhLinhas = baseSalarialRh
export const categoriasProfissionais = db.categoriasProfissionais
export const regimesTrabalho = db.regimesTrabalho
export const itensSalariais = db.itensSalariais
export const tabelasSalariais = db.tabelasSalariais
export const gruposRubrica = db.gruposRubrica
export const rubricas = db.rubricas
export const composicoesNormativas = db.composicoesNormativas
export const conjuntosRegras = db.conjuntosRegras
export const encargosGrupos = db.encargosGrupos
export const beneficiosRegras = db.beneficiosRegras
export const perfis = db.perfis
export const tiposSetor = db.tiposSetor
export const especialidades = db.especialidades
export const objetosPlanejamento = db.objetosPlanejamento
export const planos = db.planos
export const estruturas = db.estruturas
export const naturezas = db.naturezas
export const servicos = db.servicos
export const regrasQuadro = db.regrasQuadro
export const regrasCusteio = db.regrasCusteio
export const variaveisObrigatorias = db.variaveisObrigatorias
