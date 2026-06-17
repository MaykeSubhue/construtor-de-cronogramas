export function gerarCronogramaFinanceiro({ plano, escopos, calcEscopo, configGlobal, gerarCompetencias, opts = {} }) {
  const { cebas = false, reajuste = 0, modelo = 'grupos' } = opts
  const nMeses = opts.meses || plano.meses_projecao
  const compIni = opts.competenciaInicial || plano.competencia_inicial
  const mesInicialNum = opts.mesInicialNum || 1
  const fator = 1 + reajuste
  const meses = gerarCompetencias(compIni, nMeses)

  const blocosMap = new Map()
  for (const no of escopos) {
    const calc = calcEscopo(no, { cebas, modelo })
    const nome = no.bloco || no.nome
    if (!blocosMap.has(nome)) blocosMap.set(nome, { nome, noId: no.id, rh: 0, custeio: 0, itens: [], custeioItens: [] })
    const b = blocosMap.get(nome)
    b.rh += calc.rh_total * fator
    b.custeio += calc.custeio_total * fator
    calc.itens.forEach((i) => b.itens.push({
      label: i.perfil.label,
      mensal: i.custo_total * fator,
      noId: no.id,
      itemId: i.id,
      perfilId: i.perfil.id,
      quantidade: i.quantidade,
      quantidadeNormativa: i.quantidade_normativa,
      diferencaNormativa: i.quantidade_normativa != null ? i.quantidade - i.quantidade_normativa : null,
      qp40: i.qp40,
      qp30: i.qp30,
      chs: i.chs,
      memoriaCalculo: i.memoriaCalculo,
      overrideJustificado: i.overrideJustificado,
      justificativa: no.desvios?.[i.perfil.id]?.motivo || null,
    }))
    ;(no.custeio || []).forEach((c) => b.custeioItens.push({
      label: c.nome,
      mensal: c.valor_mensal * fator,
      noId: no.id,
      itemId: c.id,
    }))
  }
  const blocos = [...blocosMap.values()]

  const rhMensal = blocos.reduce((a, b) => a + b.rh, 0)
  const custeioMensal = blocos.reduce((a, b) => a + b.custeio, 0)
  const ag = configGlobal.apoioGestao
  const apoioMensal = rhMensal * (ag.cge + ag.rue)
  const parteFixaMensal = rhMensal + apoioMensal
  const parteVariavelMensal = 0
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
