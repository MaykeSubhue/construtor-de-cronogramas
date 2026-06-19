import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool'

const raiz = path.resolve(import.meta.dirname, '..')
const downloads = 'C:/Users/40775791/Downloads'
const reparados = `${process.env.TEMP}/cronograma-grupos-normalizados`
const origemModelos = path.join(raiz, 'prototipo/src/data/cronogramasProntos.js')
const destino = path.join(raiz, 'prototipo/src/data/componentesPlanilhasCronogramas.js')

const { cronogramasProntos } = await import(`${pathToFileURL(origemModelos).href}?t=${Date.now()}`)

function normalizar(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function numero(valor) {
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor
  if (valor == null || valor === '' || valor === '-') return 0
  const texto = String(valor).replace(/R\$/gi, '').replace(/\s/g, '')
  const convertido = texto.includes(',')
    ? Number(texto.replace(/\./g, '').replace(',', '.'))
    : Number(texto)
  return Number.isFinite(convertido) ? convertido : 0
}

function indice(celulas, teste) {
  return celulas.findIndex((celula) => teste(normalizar(celula)))
}

function mapearCabecalho(valores) {
  let melhor = null
  valores.slice(0, 20).forEach((linha, linhaIndex) => {
    const textos = linha.map(normalizar)
    const pontuacao = [
      textos.some((t) => t.includes('categoria')),
      textos.some((t) => t.includes('carga horaria')),
      textos.some((t) => t.includes('quantitativo')),
      textos.some((t) => t.includes('salario') || t.includes('remuneracao')),
    ].filter(Boolean).length
    if (!melhor || pontuacao > melhor.pontuacao) melhor = { linhaIndex, linha, pontuacao }
  })

  const h = melhor?.linha || []
  const remuneracaoBruta = indice(h, (t) => t.includes('remuneracao bruta'))
  const totais = h
    .map((valor, i) => ({ i, valor: normalizar(valor) }))
    .filter((item) => item.valor.includes('salario total'))
  const salarioTotal = totais.find((item) => item.i > remuneracaoBruta)?.i ?? totais[0]?.i ?? -1

  return {
    linhaIndex: melhor?.linhaIndex ?? -1,
    categoria: indice(h, (t) => t.includes('categoria')),
    chs: indice(h, (t) => t.includes('carga horaria')),
    quantidadeTurno: indice(h, (t) => t.includes('quantitativo por turno')),
    quantidade: indice(h, (t) => t.includes('quantitativo') && !t.includes('turno')),
    base: indice(h, (t) => t.includes('salario') && t.includes('base')),
    insalubridade: indice(h, (t) => t.includes('insalubridade')),
    gratificacao: indice(h, (t) => t.includes('gratificacao')),
    titulacao: indice(h, (t) => t.includes('titulacao')),
    adicionalNoturno: indice(h, (t) => t.includes('adic') && t.includes('noturno')),
    remuneracaoBruta,
    salarioTotal,
    valeRefeicao: indice(h, (t) => t.includes('vale refeicao') || t.includes('vale alimentacao')),
    valeTransporte: indice(h, (t) => t.includes('vale transporte')),
    diasOperacionais: indice(h, (t) => t.includes('dias operacionais')),
  }
}

async function caminhoFonte(nome) {
  const reparado = path.join(reparados, nome)
  try {
    await fs.access(reparado)
    return reparado
  } catch {
    return path.join(downloads, nome)
  }
}

const componentes = {}
const auditoria = []

for (const modelo of cronogramasProntos) {
  const arquivo = await caminhoFonte(modelo.fonte)
  const blob = await FileBlob.load(arquivo)
  const workbook = await SpreadsheetFile.importXlsx(blob)
  componentes[modelo.id] = {}
  const abas = workbook.worksheets.items || []

  for (const setor of modelo.setores) {
    const nomeEsperado = normalizar(setor.abaOrigem).replace(/[^a-z0-9]/g, '')
    const planilha = abas.find((aba) => {
      const nomeAba = normalizar(aba.name).replace(/[^a-z0-9]/g, '')
      return nomeAba === nomeEsperado || nomeAba.includes(nomeEsperado) || nomeEsperado.includes(nomeAba)
    })
    if (!planilha) {
      auditoria.push({
        modelo: modelo.id,
        setor: setor.id,
        abaOrigem: setor.abaOrigem,
        erro: 'aba não encontrada',
        candidatas: abas.map((aba) => aba.name),
      })
      continue
    }
    const valores = planilha.getUsedRange()?.values || []
    const colunas = mapearCabecalho(valores)
    const linhasSetor = {}

    for (const linha of setor.linhas) {
      const origem = valores[Math.max(0, Number(linha.linhaOrigem || 1) - 1)] || []
      const ler = (coluna) => coluna >= 0 ? numero(origem[coluna]) : 0
      linhasSetor[linha.id] = {
        chs: ler(colunas.chs) || Number(linha.chs) || 0,
        quantidade: ler(colunas.quantidade) || Number(linha.quantidade) || 0,
        quantidadeTurno: ler(colunas.quantidadeTurno) || Number(linha.quantidadeTurno) || 0,
        base: ler(colunas.base),
        insalubridade: ler(colunas.insalubridade),
        gratificacao: ler(colunas.gratificacao),
        titulacao: ler(colunas.titulacao),
        adicionalNoturno: ler(colunas.adicionalNoturno),
        remuneracaoBruta: ler(colunas.remuneracaoBruta),
        salarioTotal: ler(colunas.salarioTotal),
        valeRefeicaoBeneficiarios: ler(colunas.valeRefeicao),
        valeTransporteBeneficiarios: ler(colunas.valeTransporte),
        diasOperacionais: ler(colunas.diasOperacionais),
      }
    }

    componentes[modelo.id][setor.id] = linhasSetor
    auditoria.push({
      modelo: modelo.id,
      setor: setor.id,
      linhas: setor.linhas.length,
      componentesFinanceiros: Object.values(linhasSetor).filter((linha) => linha.base || linha.remuneracaoBruta).length,
      cabecalho: colunas,
    })
  }
}

const conteudo = `// Gerado por scripts/gerar-componentes-cronogramas.mjs.\n` +
  `// Preserva os valores de cada linha das planilhas de origem.\n\n` +
  `export const componentesPlanilhasCronogramas = ${JSON.stringify(componentes, null, 2)}\n`

await fs.writeFile(destino, conteudo, 'utf8')

const resumo = auditoria.reduce((acc, item) => {
  acc.setores += item.linhas ? 1 : 0
  acc.linhas += item.linhas || 0
  acc.componentesFinanceiros += item.componentesFinanceiros || 0
  if (item.erro) acc.erros.push(item)
  return acc
}, { setores: 0, linhas: 0, componentesFinanceiros: 0, erros: [] })

console.log(JSON.stringify(resumo, null, 2))
