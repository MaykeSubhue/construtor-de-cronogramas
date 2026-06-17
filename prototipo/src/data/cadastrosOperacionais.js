import { matrizHospitalar } from './matrizHospitalar.js'

export const cadastrosOperacionaisMeta = {
  versao: 'cadastros-operacionais-v1',
  geradoEm: '2026-06-17',
  fontes: {
    tiposSetor: 'Matriz tecnica v4 Rio validada + tipos dimensionadores do motor',
    servicos: 'Matriz tecnica v4 Rio validada',
    rubricas: 'Base Salarial RH.xlsx + motor financeiro do prototipo',
  },
  observacao: 'HFA/HFCF permanecem apenas como referencia de formato de cronograma.',
}

function slug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const FONTE_MATRIZ = 'Matriz tecnica v4 Rio validada'
const FONTE_FINANCEIRA = 'Base Salarial RH.xlsx / motor financeiro'

const tiposDimensionadores = [
  { id: 1, nome: 'Leitos clinicos', slug: 'leitos-clinicos', variaveis: ['Leitos operacionais', 'Leitos totais', 'Taxa de ocupacao', 'Permanencia media'] },
  { id: 2, nome: 'Leitos psiquiatricos', slug: 'leitos-psiquiatricos', variaveis: ['Leitos operacionais', 'Leitos totais', 'Funcionamento', 'Dias de funcionamento'] },
  { id: 3, nome: 'Sala de urgencia', slug: 'sala-de-urgencia', variaveis: ['Leitos de estabilizacao', 'Funcionamento'] },
  { id: 4, nome: 'Acolhimento / classificacao', slug: 'acolhimento-classificacao', variaveis: ['Funcionamento', 'Salas'] },
  { id: 5, nome: 'Apoio / administrativo', slug: 'apoio-administrativo', variaveis: [] },
  { id: 6, nome: 'Direcao', slug: 'direcao', variaveis: [] },
  { id: 7, nome: 'UTI Adulto', slug: 'uti-adulto', variaveis: ['Leitos operacionais', 'Leitos totais', 'Funcionamento', 'Dias de funcionamento'] },
].map((item) => ({
  ...item,
  classe: 'dimensionador',
  calculavel: true,
  usoMotor: true,
  ativo: true,
  origem: 'seed',
  fonte: 'Motor do prototipo',
}))

const macroareas = [...new Set((matrizHospitalar.setores || []).map((setor) => setor.macroarea).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'pt-BR'))
  .map((nome, index) => ({
    id: 1000 + index + 1,
    nome,
    slug: slug(nome),
    classe: 'macroarea',
    calculavel: false,
    usoMotor: false,
    ativo: true,
    origem: 'matriz',
    fonte: FONTE_MATRIZ,
  }))

export const tiposSetorOperacionais = [...tiposDimensionadores, ...macroareas]

const regrasPorSetor = new Map()
;(matrizHospitalar.regrasRh || []).forEach((regra) => {
  const key = regra.setorSlug
  if (!key) return
  if (!regrasPorSetor.has(key)) regrasPorSetor.set(key, [])
  regrasPorSetor.get(key).push(regra)
})

export const servicosOperacionais = (matrizHospitalar.setores || []).map((setor, index) => {
  const regras = regrasPorSetor.get(setor.slug) || []
  const parametros = [...new Set([
    setor.metricaPrincipal,
    ...regras.map((regra) => regra.metrica),
  ].filter(Boolean))]

  return {
    id: index + 1,
    nome: setor.setor,
    slug: setor.slug || slug(setor.setor),
    setor: setor.setor,
    macroarea: setor.macroarea || 'Nao informada',
    subtipo: setor.subtipo || '',
    matrizSetorSlug: setor.slug,
    metricaPrincipal: setor.metricaPrincipal || '',
    qtdRegrasRh: regras.length,
    parametrosDimensionadores: parametros,
    status: regras.length ? 'calculavel' : 'referencial',
    tratamento: setor.tratamento || '',
    baseNormativa: setor.baseNormativa || '',
    observacao: setor.observacaoImplantacao || '',
    fonte: FONTE_MATRIZ,
    origem: 'matriz',
    ativo: true,
  }
})

export const gruposRubricaOperacionais = [
  { id: 1, nome: 'Salarios' },
  { id: 2, nome: 'Adicionais' },
  { id: 3, nome: 'Encargos' },
  { id: 4, nome: 'Provisoes' },
  { id: 5, nome: 'Beneficios' },
  { id: 6, nome: 'Apoio a gestao' },
  { id: 7, nome: 'Custeio operacional' },
  { id: 8, nome: 'Parte variavel' },
  { id: 9, nome: 'Investimento' },
  { id: 10, nome: 'CEBAS / imunidade' },
  { id: 11, nome: 'Reducao comparativa' },
]

const rubrica = (id, nome, grupo, tipo, forma, extra = {}) => ({
  id,
  nome,
  slug: slug(nome),
  grupo,
  tipo,
  forma,
  percentual: extra.percentual || 0,
  valor: extra.valor || 0,
  incidencia: extra.incidencia || 'Nao aplicavel',
  entraCronograma: extra.entraCronograma !== false,
  modelo: extra.modelo || 'Cadastro financeiro',
  fonte: extra.fonte || FONTE_FINANCEIRA,
  origem: 'seed',
  ativo: true,
  observacao: extra.observacao || '',
})

export const rubricasOperacionais = [
  rubrica(1, 'Salario base', 'Salarios', 'provento', 'valor', { incidencia: 'Categoria profissional' }),
  rubrica(2, 'Insalubridade', 'Adicionais', 'provento', 'valor', { incidencia: 'Categoria profissional' }),
  rubrica(3, 'Gratificacao dificil provimento', 'Adicionais', 'provento', 'valor', { incidencia: 'Categoria profissional' }),
  rubrica(4, 'Gratificacao RT / chefia', 'Adicionais', 'provento', 'valor', { incidencia: 'Designacao formal' }),
  rubrica(5, 'Titulacao', 'Adicionais', 'provento', 'valor', { incidencia: 'Categoria profissional' }),
  rubrica(6, 'Adicional noturno', 'Adicionais', 'provento', 'percentual', { percentual: 20, incidencia: 'Salario base' }),
  rubrica(7, 'INSS Empresa', 'Encargos', 'encargo', 'percentual', { percentual: 20, incidencia: 'Salario total', observacao: 'Isento no cenario CEBAS.' }),
  rubrica(8, 'INSS Terceiros + FAP', 'Encargos', 'encargo', 'percentual', { percentual: 5.8, incidencia: 'Salario total', observacao: 'Isento no cenario CEBAS.' }),
  rubrica(9, 'PIS sobre folha', 'Encargos', 'encargo', 'percentual', { percentual: 1, incidencia: 'Salario total' }),
  rubrica(10, 'FGTS', 'Encargos', 'encargo', 'percentual', { percentual: 8, incidencia: 'Salario total' }),
  rubrica(11, '13 salario', 'Provisoes', 'provisao', 'percentual', { percentual: 8.33, incidencia: 'Salario total' }),
  rubrica(12, 'Abono de ferias', 'Provisoes', 'provisao', 'percentual', { percentual: 2.78, incidencia: 'Provisao' }),
  rubrica(13, 'Ferias proporcionais', 'Provisoes', 'provisao', 'percentual', { percentual: 8.33, incidencia: 'Provisao' }),
  rubrica(14, 'Aviso previo indenizado', 'Provisoes', 'provisao', 'percentual', { percentual: 0.42, incidencia: 'Provisao' }),
  rubrica(15, 'Aviso previo dias extras legais', 'Provisoes', 'provisao', 'percentual', { percentual: 0.83, incidencia: 'Provisao' }),
  rubrica(16, 'Multa rescisoria FGTS', 'Encargos', 'encargo', 'percentual', { percentual: 4, incidencia: 'FGTS' }),
  rubrica(17, 'Incidencias sobre 13 e ferias', 'Encargos', 'encargo', 'percentual', { percentual: 0.185, incidencia: '13 e ferias', modelo: 'Motor SUBHUE' }),
  rubrica(18, 'Demais incidencias', 'Encargos', 'encargo', 'percentual', { percentual: 5.2823, incidencia: 'Salario total', modelo: 'Motor SUBHUE' }),
  rubrica(19, 'Vale-transporte', 'Beneficios', 'beneficio', 'valor', { incidencia: 'Profissional elegivel' }),
  rubrica(20, 'Vale-refeicao / alimentacao', 'Beneficios', 'beneficio', 'valor', { incidencia: 'Profissional elegivel' }),
  rubrica(21, 'Beneficio consolidado SUBHUE', 'Beneficios', 'beneficio', 'valor', { valor: 212, incidencia: 'Profissional/mes', modelo: 'Motor SUBHUE' }),
  rubrica(22, 'Apoio a gestao CGE', 'Apoio a gestao', 'apoio_gestao', 'percentual', { percentual: 1, incidencia: 'RH do plano' }),
  rubrica(23, 'Apoio a gestao RUE-OSC', 'Apoio a gestao', 'apoio_gestao', 'percentual', { percentual: 5, incidencia: 'RH do plano' }),
  rubrica(24, 'Medicamentos', 'Custeio operacional', 'custeio', 'valor', { incidencia: 'Regra de custeio ou lancamento manual' }),
  rubrica(25, 'Gases medicinais', 'Custeio operacional', 'custeio', 'valor', { incidencia: 'Regra de custeio ou lancamento manual' }),
  rubrica(26, 'Materiais e insumos assistenciais', 'Custeio operacional', 'custeio', 'valor', { incidencia: 'Regra de custeio ou lancamento manual' }),
  rubrica(27, 'Servicos terceiros', 'Custeio operacional', 'custeio', 'valor', { incidencia: 'Contrato ou regra de custeio' }),
  rubrica(28, 'Manutencao predial e equipamentos', 'Custeio operacional', 'custeio', 'valor', { incidencia: 'Contrato ou regra de custeio' }),
  rubrica(29, 'Parte variavel por desempenho', 'Parte variavel', 'variavel', 'valor', { incidencia: 'Meta ou indicador pactuado' }),
  rubrica(30, 'Performance / producao assistencial', 'Parte variavel', 'variavel', 'valor', { incidencia: 'Producao ou parametro pactuado' }),
  rubrica(31, 'Investimento inicial', 'Investimento', 'investimento', 'valor', { incidencia: 'Parcela unica ou cronograma de investimento' }),
  rubrica(32, 'Equipamentos e mobiliario', 'Investimento', 'investimento', 'valor', { incidencia: 'Plano de investimento' }),
  rubrica(33, 'Imunidade INSS patronal CEBAS', 'CEBAS / imunidade', 'deducao', 'percentual', { percentual: -20, incidencia: 'INSS Empresa', modelo: 'Cenario CEBAS' }),
  rubrica(34, 'Imunidade terceiros/FAP CEBAS', 'CEBAS / imunidade', 'deducao', 'percentual', { percentual: -5.8, incidencia: 'INSS Terceiros + FAP', modelo: 'Cenario CEBAS' }),
  rubrica(35, 'Reducao comparativa com CEBAS', 'Reducao comparativa', 'comparativo', 'valor', { incidencia: 'Diferenca entre cenarios', modelo: 'Comparativo' }),
]
