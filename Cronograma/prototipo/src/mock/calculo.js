import { matrizHospitalar, regrasRhMatriz, setoresMatriz } from '../data/matrizHospitalar.js'
import { baseSalarialRh } from '../data/baseSalarialRh.js'

export function slug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function regrasPorSetor(setorSlug) {
  return regrasRhMatriz.filter((regra) => regra.setorSlug === setorSlug)
}

export function setorMatrizPorSlug(setorSlug) {
  return setoresMatriz.find((setor) => setor.slug === setorSlug)
}

export function defaultChs(regra) {
  const texto = `${regra.macroarea} ${regra.categoria} ${regra.funcao}`.toLowerCase()
  if (texto.includes('gest') || texto.includes('administrativo') || texto.includes('diretor')) return 40
  return 30
}

function ceil(value) {
  return Math.ceil(Number(value) || 0)
}

export function calcularRegraRh(regra, entrada, chsEscolhida = defaultChs(regra)) {
  const valor = Number(entrada) || 0
  const base = Number(regra.base) || 1
  const qtdPorBase = Number(regra.qtdPorBase) || 1
  const turnosDia = Number(regra.turnosDia) || 1
  const horas = Number(regra.horas) || 0
  const diasSemana = Number(regra.diasSemana) || matrizHospitalar.constantes.diasSemanaPadrao
  const ist = Number(regra.ist) || 0
  const tipo = regra.tipoCalculo

  let simultanea = 0
  let postosDia = 0
  let horasSemana = 0
  let formula = ''

  if (tipo === 'ratio_turno') {
    simultanea = ceil(valor / base) * qtdPorBase
    postosDia = simultanea * turnosDia
    horasSemana = postosDia * horas * diasSemana
    formula = `ceil(${valor} / ${base}) * ${qtdPorBase}; postos/dia = ${simultanea} * ${turnosDia}; horas = ${postosDia} * ${horas} * ${diasSemana}`
  } else if (tipo === 'fixo_setor') {
    simultanea = valor * qtdPorBase
    postosDia = simultanea * turnosDia
    horasSemana = postosDia * horas * diasSemana
    formula = `${valor} * ${qtdPorBase}; postos/dia = ${simultanea} * ${turnosDia}; horas = ${postosDia} * ${horas} * ${diasSemana}`
  } else if (tipo === 'ratio_evento') {
    simultanea = valor * qtdPorBase
    postosDia = simultanea
    horasSemana = valor * horas
    formula = `${valor} * ${qtdPorBase}; horas = ${valor} * ${horas}`
  } else if (tipo === 'horas_paciente_dia') {
    simultanea = null
    postosDia = null
    horasSemana = valor * horas * diasSemana
    formula = `${valor} * ${horas} * ${diasSemana}`
  } else {
    simultanea = valor * qtdPorBase
    postosDia = simultanea * turnosDia
    horasSemana = postosDia * horas * diasSemana
    formula = `${valor} * ${qtdPorBase}`
  }

  const qp40 = horasSemana ? ceil((horasSemana * (1 + ist)) / matrizHospitalar.constantes.chs40) : ceil(simultanea || 0)
  const qp30 = horasSemana ? ceil((horasSemana * (1 + ist)) / matrizHospitalar.constantes.chs30) : ceil(simultanea || 0)
  const quantidadeNormativa = Number(chsEscolhida) === 40 ? qp40 : qp30

  return {
    entrada: valor,
    simultanea,
    postosDia,
    horasSemana,
    qp40,
    qp30,
    chs: Number(chsEscolhida),
    quantidadeNormativa,
    formula,
    ist,
  }
}

export function valorParametro(no, metricaSlug) {
  const parametro = (no.parametros || []).find((p) => slug(p.id || p.nome) === metricaSlug || p.metricaSlug === metricaSlug)
  if (parametro && parametro.valor !== '' && parametro.valor != null) return Number(parametro.valor)
  return null
}

export function valorPadraoMetrica(metrica, quantidade = 1, unidade = '') {
  const m = slug(metrica)
  const u = slug(unidade)
  if (m.includes('leito')) return u.includes('leito') ? quantidade : quantidade || 1
  if (m.includes('sala')) return u.includes('sala') ? quantidade : quantidade || 1
  if (m.includes('consultorio')) return u.includes('consultorio') ? quantidade : quantidade || 1
  if (m.includes('hospital') || m.includes('unidade') || m.includes('servico') || m.includes('uti') || m.includes('farmacia')) return 1
  if (m.includes('funcionamento')) return 24
  if (m.includes('dia')) return matrizHospitalar.constantes.diasSemanaPadrao
  return quantidade || 1
}

export function parametrosParaRegras(regras, quantidade = 1, unidade = '') {
  const porSlug = new Map()
  regras.forEach((regra) => {
    if (!porSlug.has(regra.metricaSlug)) {
      porSlug.set(regra.metricaSlug, {
        id: regra.metricaSlug,
        metricaSlug: regra.metricaSlug,
        nome: regra.metrica,
        valor: valorPadraoMetrica(regra.metrica, quantidade, unidade),
        unidade: regra.metrica,
        obrigatorio: true,
      })
    }
  })
  return [...porSlug.values()]
}

const salarioPorSlug = Object.fromEntries(baseSalarialRh.map((item) => [item.slug, item]))

function row(slugKey, fallback = false) {
  const item = salarioPorSlug[slugKey] || salarioPorSlug['equipe-multi-biomedico-fono-fisio-psico-nutri-t-o-ass-soc-farmaceutico']
  return { ...item, fallbackSalarial: fallback || !salarioPorSlug[slugKey] }
}

export function resolverBaseSalarialRh(regra = {}) {
  const texto = slug(`${regra.funcao} ${regra.categoria}`)

  if (texto.includes('diretor-clinico')) return row('diretor-medico-hospital')
  if (texto.includes('diretor-tecnico') || texto.includes('medico-responsavel-tecnico-da-uti') || texto.includes('medico-rt')) return row('coordenador-medico-responsavel-tecnico')
  if (texto.includes('coordenador-medico')) return row('coordenador-medico')
  if (texto.includes('diretor-administrativo')) return row('diretor-administrativo-responsavel-tecnico')
  if (texto.includes('diretor')) return row('diretor-unidade')
  if (texto.includes('gerente-multiprofissional')) return row('gerente-multiprofissional')
  if (texto.includes('gerente')) return row('gerente')
  if (texto.includes('supervisor')) return row('supervisor-administrativo')
  if (texto.includes('coordenador-de-processo')) return row('coordenador-de-processo')
  if (texto.includes('coordenador-administrativo')) return row('coordenador-administrativo')

  if (texto.includes('medico-anest')) return row('medico-anestesista')
  if (texto.includes('medico-diarista') || texto.includes('horizontalista') || texto.includes('rotineiro')) return row('medico-rotina')
  if (texto.includes('medico')) return row('medico-plantonista')

  if (texto.includes('enfermeiro-responsavel') || texto.includes('ert') || texto.includes('art')) return row('coordenador-de-enfermagem-responsavel-tecnico')
  if (texto.includes('enfermeiro-coordenador')) return row('coordenador-de-enfermagem')
  if (texto.includes('enfermeiro') && texto.includes('rotina')) return row('enfermeiro-rotina')
  if (texto.includes('enfermeiro')) return row('enfermeiro-plantonista')

  if (texto.includes('instrumentador')) return row('tecnico-de-enfermagem-instrumentador')
  if (texto.includes('tecnico') && texto.includes('enfermagem') && texto.includes('rotina')) return row('tec-de-enfermagem-rotina')
  if (texto.includes('tecnico') && texto.includes('enfermagem')) return row('tec-de-enfermagem')
  if (texto.includes('circulante') || texto.includes('cme')) return row('tec-de-enfermagem')

  if (texto.includes('farmacia') && texto.includes('coordenador')) return row('coordenador-de-farmacia')
  if (texto.includes('auxiliar-tecnico-de-farmacia') || texto.includes('tec-de-farmacia') || texto.includes('farmacia')) return row('tec-de-farmacia')
  if (texto.includes('fisioterapeuta') && texto.includes('coordenador')) return row('coordenador-de-fisioterapia')
  if (texto.includes('nutricionista') && texto.includes('coordenador')) return row('coordenador-de-nutricao')
  if (texto.includes('psicologo') && texto.includes('coordenador')) return row('coordenador-de-psicologia')
  if (texto.includes('servico-social') && texto.includes('coordenador')) return row('coordenador-de-servico-social')
  if (texto.includes('fisioterapeuta') || texto.includes('fono') || texto.includes('psicologo') || texto.includes('nutricionista') || texto.includes('terapeuta') || texto.includes('assistente-social') || texto.includes('multiprofissional') || texto.includes('farmaceutico')) {
    return row('equipe-multi-biomedico-fono-fisio-psico-nutri-t-o-ass-soc-farmaceutico')
  }

  if (texto.includes('cirurgiao-dentista')) return row('dentista')
  if (texto.includes('bucomaxilo')) return row('bucomaxilo')
  if (texto.includes('radiologia') && texto.includes('responsavel')) return row('tec-de-raio-x-responsavel-tecnico')
  if (texto.includes('radiologia') || texto.includes('raio')) return row('tec-de-raio-x')
  if (texto.includes('tecnico-de-ti') || texto.includes('tecnologia')) return row('tecnico-de-tecnologia-da-informacao')
  if (texto.includes('maqueiro')) return row('maqueiro')
  if (texto.includes('nutricao-producao') || texto.includes('snd')) return row('tec-de-nutricao')
  if (texto.includes('auxiliar-administrativo')) return row('auxiliar-administrativo')
  if (texto.includes('administrativo')) return row('tecnico-administrativo')
  if (texto.includes('limpeza') || texto.includes('higienizacao')) return row('auxiliar-de-suprimentos', true)
  if (texto.includes('residuos') || texto.includes('rss')) return row('auxiliar-de-suprimentos', true)
  if (texto.includes('manutencao')) return row('supervisor-de-base', true)
  if (texto.includes('engenheiro-clinico')) return row('supervisor-de-base', true)

  return row('equipe-multi-biomedico-fono-fisio-psico-nutri-t-o-ass-soc-farmaceutico', true)
}

export function salarioRhParaRegra(regra = {}) {
  const ref = resolverBaseSalarialRh(regra)
  return {
    base: Number(ref.baseSalarial) || 0,
    insalubridade: 0,
    gratificacao: Number(ref.gratificacaoDificilProvimento) || 0,
    titulacao: Number(ref.gratificacaoTitulacao) || 0,
    adicional_noturno: 0,
    referenciaSalarial: ref,
    provisorio: !!ref.fallbackSalarial,
  }
}

export function prescricaoMatriz(no) {
  const regras = regrasPorSetor(no.matrizSetorSlug)
  return regras.map((regra) => {
    const chs = no.chsPorRegra?.[regra.id] || defaultChs(regra)
    const entrada = valorParametro(no, regra.metricaSlug) ?? valorPadraoMetrica(regra.metrica, 1)
    const calc = calcularRegraRh(regra, entrada, chs)
    const referenciaSalarial = resolverBaseSalarialRh(regra)
    const perfil = {
      id: `matrix:${regra.id}`,
      label: referenciaSalarial.categoria,
      categoria: referenciaSalarial.categoria,
      funcaoNormativa: regra.funcao,
      regraMatrizId: regra.id,
      referenciaSalarial,
    }
    return {
      perfilId: perfil.id,
      perfil,
      regra,
      qtd: calc.quantidadeNormativa,
      qtdNormativa: calc.quantidadeNormativa,
      qp40: calc.qp40,
      qp30: calc.qp30,
      chs: calc.chs,
      entrada: calc.entrada,
      horasSemana: calc.horasSemana,
      turno: regra.natureza || '—',
      tipo: regra.tipoCalculo,
      base: regra.base,
      fator: regra.qtdPorBase,
      fonte: regra.fonte,
      texto: `${regra.fonte}${regra.observacaoTecnica ? ` — ${regra.observacaoTecnica}` : ''}`,
      rascunho: /rascunho|revisar/i.test(`${regra.fonte} ${regra.observacaoTecnica} ${regra.revisarLocal}`),
      memoriaCalculo: {
        regraId: regra.id,
        setor: regra.setor,
        funcao: regra.funcao,
        metrica: regra.metrica,
        entrada: calc.entrada,
        tipoCalculo: regra.tipoCalculo,
        formula: calc.formula,
        horasSemana: calc.horasSemana,
        qp40: calc.qp40,
        qp30: calc.qp30,
        chs: calc.chs,
        quantidadeNormativa: calc.quantidadeNormativa,
        fonte: regra.fonte,
        url: regra.url,
        esferaNorma: regra.esferaNorma,
        aplicabilidadeRio: regra.aplicabilidadeRio,
        baseRioValidacao: regra.baseRioValidacao,
        observacaoTerritorial: regra.observacaoTerritorial,
      },
    }
  })
}

export function salarioProvisorioPorCategoria(categoria) {
  const c = slug(categoria)
  if (c.includes('medico')) return { base: 9000, insalubridade: 303.6, gratificacao: 0, titulacao: 0, adicional_noturno: 0 }
  if (c.includes('enfermagem') && !c.includes('tecnico')) return { base: 4500, insalubridade: 303.6, gratificacao: 0, titulacao: 0, adicional_noturno: 0 }
  if (c.includes('tecnico')) return { base: 2200, insalubridade: 303.6, gratificacao: 0, titulacao: 0, adicional_noturno: 0 }
  if (c.includes('administrativo')) return { base: 2500, insalubridade: 0, gratificacao: 0, titulacao: 0, adicional_noturno: 0 }
  if (c.includes('limpeza') || c.includes('higien')) return { base: 1800, insalubridade: 303.6, gratificacao: 0, titulacao: 0, adicional_noturno: 0 }
  return { base: 4200, insalubridade: 303.6, gratificacao: 0, titulacao: 0, adicional_noturno: 0 }
}

export function perfilMatriz(perfilId) {
  const regraId = String(perfilId).replace('matrix:', '')
  const regra = regrasRhMatriz.find((r) => r.id === regraId)
  if (!regra) return null
  const referenciaSalarial = resolverBaseSalarialRh(regra)
  return {
    id: perfilId,
    label: referenciaSalarial.categoria,
    categoria: referenciaSalarial.categoria,
    funcaoNormativa: regra.funcao,
    regime: null,
    matriz: true,
    regraMatrizId: regra.id,
    referenciaSalarial,
    sal: salarioRhParaRegra(regra),
  }
}
