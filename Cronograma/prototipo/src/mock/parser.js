import { regrasRhMatriz, setoresMatriz } from '../data/matrizHospitalar.js'
import { parametrosParaRegras, regrasPorSetor, slug } from './calculo.js'

const ALIASES = [
  { termos: ['uti adulto', 'uti adulta', 'terapia intensiva adulto'], setorSlug: 'uti-adulto', unidade: 'leitos' },
  { termos: ['uti pediatrica', 'uti pediátrica'], setorSlug: 'uti-pediatrica', unidade: 'leitos' },
  { termos: ['uti neonatal', 'neonatal'], setorSlug: 'uti-neonatal', unidade: 'leitos' },
  { termos: ['enfermaria clinica adulto', 'enfermaria clínica adulto', 'clinica adulto', 'clínica adulto'], setorSlug: 'enfermaria-clinica-adulto', unidade: 'leitos' },
  { termos: ['centro cirurgico', 'centro cirúrgico', 'cc'], setorSlug: 'centro-cirurgico', unidade: 'salas' },
  { termos: ['sala vermelha', 'estabilizacao', 'estabilização'], setorSlug: 'sala-vermelha-estabilizacao', unidade: 'leitos' },
  { termos: ['observacao adulto', 'observação adulto'], setorSlug: 'observacao-adulto', unidade: 'leitos' },
]

function scoreSetor(textoSlug, setor) {
  const tokens = setor.slug.split('-').filter((token) => token.length > 2)
  return tokens.reduce((acc, token) => acc + (textoSlug.includes(token) ? 1 : 0), 0)
}

export function sugerirSetorPorTexto(texto) {
  const raw = String(texto || '')
  const textoSlug = slug(raw)
  const numeroTexto = raw.match(/\d+(?:[,.]\d+)?/)?.[0] || '1'
  const numero = Number(numeroTexto.replace(',', '.')) || 1
  let unidade = textoSlug.includes('sala') ? 'salas' : 'leitos'
  let setorSlug = null

  for (const alias of ALIASES) {
    if (alias.termos.some((termo) => textoSlug.includes(slug(termo)))) {
      setorSlug = alias.setorSlug
      unidade = alias.unidade
      break
    }
  }

  if (!setorSlug) {
    const scored = setoresMatriz
      .map((setor) => ({ setor, score: scoreSetor(textoSlug, setor) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
    setorSlug = scored[0]?.setor.slug
  }

  const regras = setorSlug ? regrasPorSetor(setorSlug) : []
  const setor = setoresMatriz.find((item) => item.slug === setorSlug) || {
    slug: setorSlug,
    setor: raw.trim() || 'Setor novo',
    macroarea: '',
    baseNormativa: '',
  }
  const parametros = parametrosParaRegras(regras, numero, unidade)
  const fontes = [...new Set(regras.map((regra) => regra.fonte).filter(Boolean))]

  return {
    texto: raw,
    setorSlug,
    setor,
    quantidade: numero,
    unidade,
    regras,
    parametros,
    fontes,
    confianca: regras.length ? Math.min(100, 40 + regras.length * 5) : 20,
    aviso: regras.length ? '' : 'Nenhuma regra da matriz encontrada para esta descrição. O setor será criado sem quadro automático.',
  }
}

export function exemplosParser() {
  return [
    'UTI Adulto 10 leitos',
    'UTI Adulto 11 leitos',
    'enfermaria clínica adulto 30 leitos',
    'centro cirúrgico 6 salas',
  ].map(sugerirSetorPorTexto)
}

export function regrasDisponiveisParaSetor(setorSlug) {
  return regrasRhMatriz.filter((regra) => regra.setorSlug === setorSlug)
}
