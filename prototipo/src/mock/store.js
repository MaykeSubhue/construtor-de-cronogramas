const STORAGE_KEY = 'cronogramaNormativoMvp:v9'
const LEGACY_STORAGE_KEYS = ['cronogramaNormativoMvp:v8', 'cronogramaNormativoMvp:v7', 'cronogramaNormativoMvp:v6', 'cronogramaNormativoMvp:v5', 'cronogramaNormativoMvp:v4', 'cronogramaNormativoMvp:v3', 'cronogramaNormativoMvp:v2', 'cronogramaNormativoMvp:v1']
const STORE_VERSION = 9

const STORED_KEYS = [
  'categoriasProfissionais',
  'regimesTrabalho',
  'perfis',
  'itensSalariais',
  'configGlobal',
  'encargosGrupos',
  'beneficiosRegras',
  'gruposRubrica',
  'rubricas',
  'conjuntosRegras',
  'composicoesNormativas',
  'tabelasSalariais',
  'especialidades',
  'tiposSetor',
  'objetosPlanejamento',
  'planos',
  'estruturas',
  'statusLabels',
  'seiStatusLabels',
  'naturezas',
  'servicos',
  'regrasQuadro',
  'regrasCusteio',
  'variaveisObrigatorias',
  'lancamentosCronograma',
]

const LEGACY_DEMO_CNES = new Set(['7654321', '2345678', '2270250', '2295415'])
const LEGACY_DEMO_UNITS = new Set([
  'cer-centro',
  'upa-penha',
  'hospital-municipal-souza-aguiar',
  'maternidade-leila-diniz',
])

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function initialState(seed) {
  return Object.fromEntries(STORED_KEYS.map((key) => [key, clone(seed[key])]))
}

function canUseStorage() {
  return typeof window !== 'undefined' && window.localStorage
}

function chaveCadastro(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function mergeCompatible(seedState, persisted) {
  if (!persisted || typeof persisted !== 'object') return seedState
  const compatible = Object.fromEntries(
    Object.entries(persisted).filter(([key, value]) => STORED_KEYS.includes(key) && value !== undefined && value !== null),
  )
  return {
    ...seedState,
    ...compatible,
    statusLabels: seedState.statusLabels,
    seiStatusLabels: seedState.seiStatusLabels,
  }
}

function legacyDemoUnit(unit, version) {
  if (Number(version || 1) >= STORE_VERSION) return false
  const cnes = String(unit?.cnes || '')
  const nome = chaveCadastro(unit?.nome)
  return LEGACY_DEMO_CNES.has(cnes) || LEGACY_DEMO_UNITS.has(nome)
}

function mergeUnidades(seedUnits, persistedUnits, version) {
  const porCnes = new Map()
  const manuaisSemCnes = []

  ;(seedUnits || []).forEach((unit) => {
    porCnes.set(String(unit.cnes), clone(unit))
  })

  ;(Array.isArray(persistedUnits) ? persistedUnits : []).forEach((unit) => {
    if (!unit || typeof unit !== 'object' || legacyDemoUnit(unit, version)) return
    const cnes = String(unit.cnes || '').trim()
    if (!cnes) {
      manuaisSemCnes.push(clone(unit))
      return
    }
    const atual = porCnes.get(cnes)
    if (atual) {
      porCnes.set(cnes, {
        ...atual,
        ...unit,
        id: atual.id,
        cnes: atual.cnes,
        nome: atual.nome || unit.nome,
        sigla: atual.sigla || unit.sigla,
        tipo: atual.tipo || unit.tipo,
        ap: atual.ap || unit.ap || 'Não informada',
        ativo: unit.ativo ?? atual.ativo ?? true,
        fonte: atual.fonte || unit.fonte,
      })
    } else {
      porCnes.set(cnes, { origem: 'manual', ativo: true, ...clone(unit) })
    }
  })

  const usados = new Set([...porCnes.values()].map((unit) => unit.id).filter((id) => id != null))
  let proximoId = Math.max(0, ...usados) + 1
  manuaisSemCnes.forEach((unit) => {
    const novo = { origem: 'manual', ativo: true, ...unit }
    if (novo.id == null || usados.has(novo.id)) novo.id = proximoId++
    usados.add(novo.id)
    porCnes.set(`manual:${novo.id}:${chaveCadastro(novo.nome)}`, novo)
  })

  return [...porCnes.values()]
}

function mergeEspecialidades(seedEspecialidades, persistedEspecialidades) {
  const porNome = new Map()

  ;(seedEspecialidades || []).forEach((item) => {
    porNome.set(chaveCadastro(item.nome), clone(item))
  })

  ;(Array.isArray(persistedEspecialidades) ? persistedEspecialidades : []).forEach((item) => {
    if (!item || typeof item !== 'object') return
    const key = chaveCadastro(item.nome)
    const atual = porNome.get(key)
    if (atual) {
      porNome.set(key, {
        ...atual,
        ...item,
        id: atual.id,
        nome: atual.nome || item.nome,
        fonte: atual.fonte || item.fonte,
        cbos: atual.cbos || item.cbos,
        ocupacoesFonte: atual.ocupacoesFonte || item.ocupacoesFonte,
        quantidadeVinculos: atual.quantidadeVinculos ?? item.quantidadeVinculos,
        revisao: Boolean(atual.revisao || item.revisao),
      })
    } else {
      porNome.set(key, { origem: 'manual', ...clone(item) })
    }
  })

  return [...porNome.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

function mergeCategoriasProfissionais(seedCategorias, persistedCategorias, version) {
  const porChave = new Map()
  const usados = new Set()

  ;(seedCategorias || []).forEach((item) => {
    const cloneItem = clone(item)
    const key = chaveCadastro(cloneItem.slug || cloneItem.nome)
    if (!key) return
    porChave.set(key, cloneItem)
    if (cloneItem.id != null) usados.add(cloneItem.id)
  })

  let proximoId = Math.max(0, ...usados) + 1
  ;(Array.isArray(persistedCategorias) ? persistedCategorias : []).forEach((item) => {
    if (!item || typeof item !== 'object') return
    const itemManual = item.origem === 'manual'
    if (!itemManual && Number(version || 1) < STORE_VERSION) return

    const key = chaveCadastro(item.slug || item.nome)
    if (!key) return
    const atual = porChave.get(key)

    if (atual) {
      porChave.set(key, {
        ...atual,
        ...clone(item),
        id: atual.id,
        slug: atual.slug || item.slug || key,
        origem: atual.origem || item.origem,
        fonte: atual.fonte || item.fonte,
        temSalario: Boolean(atual.temSalario || item.temSalario),
      })
      return
    }

    const novo = clone(item)
    if (novo.id == null || usados.has(novo.id)) novo.id = proximoId++
    usados.add(novo.id)
    porChave.set(key, {
      origem: itemManual ? 'manual' : 'persistido',
      ativo: true,
      slug: item.slug || key,
      grupo: item.grupo || 'Manual',
      conselho: item.conselho || '—',
      status: item.status || (itemManual ? 'manual' : 'revisar'),
      ...novo,
    })
  })

  return [...porChave.values()].sort((a, b) => {
    const aCritico = Number(a.id) <= 7 ? 0 : 1
    const bCritico = Number(b.id) <= 7 ? 0 : 1
    if (aCritico !== bCritico) return aCritico - bCritico
    if (aCritico === 0) return Number(a.id) - Number(b.id)
    return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR')
  })
}

function mergeCatalogoSeed(seedItems, persistedItems, keyFn, version) {
  const porChave = new Map()
  const usados = new Set()

  ;(seedItems || []).forEach((item) => {
    const cloneItem = clone(item)
    const key = keyFn(cloneItem)
    if (!key) return
    porChave.set(key, cloneItem)
    if (cloneItem.id != null) usados.add(cloneItem.id)
  })

  let proximoId = Math.max(0, ...usados) + 1
  ;(Array.isArray(persistedItems) ? persistedItems : []).forEach((item) => {
    if (!item || typeof item !== 'object') return
    const key = keyFn(item)
    if (!key) return
    const atual = porChave.get(key)
    const itemManual = item.origem === 'manual'

    if (atual) {
      if (Number(version || 1) >= STORE_VERSION || itemManual) {
        porChave.set(key, {
          ...atual,
          ...clone(item),
          id: atual.id,
          origem: atual.origem || item.origem,
          fonte: atual.fonte || item.fonte,
        })
      }
      return
    }

    if (!itemManual && Number(version || 1) < STORE_VERSION) return
    const novo = clone(item)
    if (novo.id == null || usados.has(novo.id)) novo.id = proximoId++
    usados.add(novo.id)
    porChave.set(key, { origem: itemManual ? 'manual' : 'persistido', ativo: true, ...novo })
  })

  return [...porChave.values()]
}

function chaveTipoSetor(item) {
  return chaveCadastro(item?.slug || item?.nome)
}

function chaveServico(item) {
  return chaveCadastro(item?.matrizSetorSlug || item?.slug || item?.nome)
}

function chaveRubrica(item) {
  return `${chaveCadastro(item?.slug || item?.nome)}:${chaveCadastro(item?.grupo)}`
}

function loadPersistedPayload() {
  const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
  for (const key of keys) {
    const raw = window.localStorage.getItem(key)
    if (!raw) continue
    const parsed = JSON.parse(raw)
    return { key, parsed }
  }
  return null
}

function migrateState(seedState, parsed) {
  const version = Number(parsed?.version || 1)
  const persisted = parsed?.state && typeof parsed.state === 'object' ? parsed.state : {}
  const merged = mergeCompatible(seedState, persisted)

  return {
    ...merged,
    objetosPlanejamento: mergeUnidades(seedState.objetosPlanejamento, persisted.objetosPlanejamento, version),
    especialidades: mergeEspecialidades(seedState.especialidades, persisted.especialidades),
    categoriasProfissionais: mergeCategoriasProfissionais(seedState.categoriasProfissionais, persisted.categoriasProfissionais, version),
    tiposSetor: mergeCatalogoSeed(seedState.tiposSetor, persisted.tiposSetor, chaveTipoSetor, version),
    servicos: mergeCatalogoSeed(seedState.servicos, persisted.servicos, chaveServico, version),
    rubricas: mergeCatalogoSeed(seedState.rubricas, persisted.rubricas, chaveRubrica, version),
    statusLabels: seedState.statusLabels,
    seiStatusLabels: seedState.seiStatusLabels,
  }
}

export function initStore(seed) {
  const seedState = initialState(seed)
  if (!canUseStorage()) return seedState

  try {
    const payload = loadPersistedPayload()
    if (!payload) return seedState
    return migrateState(seedState, payload.parsed)
  } catch (error) {
    console.warn('Falha ao carregar estado local do cronograma', error)
    return seedState
  }
}

export function persistStore(state) {
  if (!canUseStorage()) return
  try {
    const planosPersistiveis = (state.planos || []).filter((plano) => !plano.planoReferencia)
    const idsPersistiveis = new Set(planosPersistiveis.map((plano) => String(plano.id)))
    const estruturasPersistiveis = Object.fromEntries(
      Object.entries(state.estruturas || {}).filter(([planoId]) => idsPersistiveis.has(String(planoId))),
    )
    const lancamentosPersistiveis = Object.fromEntries(
      Object.entries(state.lancamentosCronograma || {}).filter(([planoId]) => idsPersistiveis.has(String(planoId))),
    )
    const serializable = Object.fromEntries(STORED_KEYS.map((key) => {
      if (key === 'planos') return [key, planosPersistiveis]
      if (key === 'estruturas') return [key, estruturasPersistiveis]
      if (key === 'lancamentosCronograma') return [key, lancamentosPersistiveis]
      return [key, state[key]]
    }))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: STORE_VERSION,
      savedAt: new Date().toISOString(),
      state: serializable,
    }))
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
  } catch (error) {
    console.warn('Falha ao salvar estado local do cronograma', error)
  }
}

export function resetStore() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(STORAGE_KEY)
  LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
}
