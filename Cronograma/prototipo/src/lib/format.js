// Utilitários de formatação — pt-BR, moeda e números.

const moedaFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numFmt = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function brl(v) {
  if (v == null || isNaN(v)) return '—'
  return moedaFmt.format(v)
}

// Versão compacta para tabelas largas (sem o "R$").
export function brlc(v) {
  if (v == null || isNaN(v)) return '—'
  return numFmt.format(Math.round(v))
}

export function num(v, casas = 2) {
  if (v == null || isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas })
}

export function pct(v, casas = 1) {
  if (v == null || isNaN(v)) return '—'
  return `${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas })}%`
}

// "2026-01" -> "jan/26"
const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
export function competenciaLabel(comp) {
  if (!comp) return '—'
  const [ano, mes] = comp.split('-')
  return `${meses[Number(mes) - 1]}/${ano.slice(2)}`
}

// Gera lista de competências a partir de uma inicial e nº de meses.
export function gerarCompetencias(inicial, n) {
  const [ano0, mes0] = inicial.split('-').map(Number)
  const out = []
  for (let i = 0; i < n; i++) {
    const d = new Date(ano0, mes0 - 1 + i, 1)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}
