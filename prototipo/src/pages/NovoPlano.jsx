import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as api from '../mock/api.js'
import { Badge, Note } from '../components/ui.jsx'

const passos = ['Tipo', 'Unidade', 'Configuração', 'Prévia', 'Criar']

const tiposUnidade = ['Hospital geral', 'Hospital especializado', 'Maternidade', 'UPA 24h', 'CER', 'Unidade especializada']

export default function NovoPlano() {
  const nav = useNavigate()
  const loc = useLocation()
  const boot = api.getBootstrap()
  const paramsUrl = new URLSearchParams(loc.search)
  const cronogramasProntos = api.listCronogramasProntos()
  const modoInicial = paramsUrl.get('modo') === 'modelo' ? 'modelo' : 'setor'
  const cronogramaProntoInicial = paramsUrl.get('modelo') || cronogramasProntos[0]?.id || ''
  const [step, setStep] = useState(0)
  const [f, setF] = useState(() => ({
    modo: modoInicial,
    nome: '',
    unidadeModo: 'existente',
    objeto_planejamento_id: boot.objetos_planejamento[0]?.id,
    unidadeNova: { nome: '', sigla: '', cnes: '', tipoUnidade: 'Hospital geral' },
    competencia_inicial: '2026-01',
    meses_projecao: modoInicial === 'modelo' ? 24 : 12,
    tabela_salarial_id: boot.tabelas_salariais[0]?.id || 1,
    setorTexto: 'UTI Adulto 20 leitos',
    templateId: api.perfisHospitalares[0]?.id || 'hospital-geral-emergencia',
    setores: api.setoresDoPerfilHospitalar(api.perfisHospitalares[0]?.id || 'hospital-geral-emergencia'),
    cronogramaProntoId: cronogramaProntoInicial,
    sei: '',
  }))
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const setUnidadeNova = (k, v) => setF((s) => ({ ...s, unidadeNova: { ...s.unidadeNova, [k]: v } }))
  const setTemplate = (id) => setF((s) => ({ ...s, templateId: id, setores: api.setoresDoPerfilHospitalar(id) }))
  const setSetor = (slug, patch) => setF((s) => ({
    ...s,
    setores: s.setores.map((item) => item.slug === slug ? { ...item, ...patch } : item),
  }))

  const payload = useMemo(() => ({
    modo: f.modo,
    nome: f.nome,
    unidade: f.unidadeModo === 'nova'
      ? { tipo: 'nova', ...f.unidadeNova }
      : { tipo: 'existente', id: Number(f.objeto_planejamento_id) },
    competencia_inicial: f.competencia_inicial,
    meses_projecao: f.meses_projecao,
    tabela_salarial_id: f.tabela_salarial_id,
    setorTexto: f.setorTexto,
    templateId: f.templateId,
    cronogramaProntoId: f.cronogramaProntoId,
    setores: f.setores,
    sei: f.sei,
  }), [f])

  const preview = f.modo === 'modelo'
    ? api.previewCronogramaPronto(f.cronogramaProntoId, payload)
    : api.previewPlanoNormativo(payload)
  const pendenciasJustificativa = f.modo === 'hospital'
    ? f.setores.filter((item) => item.obrigatorio && item.ativo === false && !item.justificativa?.trim())
    : []
  const unidadeValida = f.unidadeModo === 'existente' ? !!f.objeto_planejamento_id : !!f.unidadeNova.nome.trim()
  const configValida = f.modo === 'setor' ? !!f.setorTexto.trim() : f.modo === 'modelo' ? !!f.cronogramaProntoId : !!f.templateId
  const podeAvancar =
    (step !== 1 || unidadeValida) &&
    (step !== 2 || configValida) &&
    (step !== 3 || pendenciasJustificativa.length === 0)
  const podeCriar = unidadeValida && configValida && pendenciasJustificativa.length === 0

  const criar = () => {
    if (f.modo === 'modelo') {
      const plano = api.criarPlanoDeCronogramaPronto(f.cronogramaProntoId, payload)
      nav(`/plano/${plano.id}/lancamentos`)
      return
    }
    const plano = api.criarPlanoNormativo(payload)
    nav(`/plano/${plano.id}/construcao`)
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <h1>Novo cronograma</h1>
          <div className="sub">Crie um setor ou hospital com estrutura e RH preenchidos pela matriz normativa validada.</div>
        </div>
      </div>

      <div className="wizard-steps">
        {passos.map((p, i) => (
          <div key={p} className={`wstep ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            <span className="n">{i < step ? '✓' : i + 1}</span>
            <span>{p}</span>
            {i < passos.length - 1 && <span className="wstep-sep" />}
          </div>
        ))}
      </div>

      <div className="card card-pad">
        {step === 0 && (
          <>
            <div className="section-title">O que você quer construir?</div>
            <div className="grid cols-3">
              <Opcao
                ativo={f.modo === 'setor'}
                ico="🧩"
                titulo="Setor específico"
                texto="Ex.: UTI Adulto 20 leitos, centro cirúrgico 6 salas. O sistema reconhece o setor e carrega RH normativo."
                onClick={() => setF((s) => ({ ...s, modo: 'setor', meses_projecao: 12 }))}
              />
              <Opcao
                ativo={f.modo === 'hospital'}
                ico="🏥"
                titulo="Hospital / unidade completa"
                texto="Cria uma árvore inicial de setores por perfil hospitalar e calcula o que já está estruturado na matriz."
                onClick={() => setF((s) => ({ ...s, modo: 'hospital', meses_projecao: 12 }))}
              />
              <Opcao
                ativo={f.modo === 'modelo'}
                ico="ðŸ§¾"
                titulo="Modelo pronto"
                texto="Clona um cronograma HMLJ, HFA ou HFCF ja preenchido e recalcula tudo no motor do app."
                onClick={() => setF((s) => ({ ...s, modo: 'modelo', meses_projecao: 24 }))}
              />
            </div>
            <Note icon="📜">Automação nesta etapa usa somente a matriz validada e RDCs já estruturadas. ABNT entra depois como base própria.</Note>
          </>
        )}

        {step === 1 && (
          <>
            <div className="section-title">Unidade</div>
            <div className="pill-toggle mb-2">
              <button className={f.unidadeModo === 'existente' ? 'active' : ''} onClick={() => set('unidadeModo', 'existente')}>Unidade cadastrada</button>
              <button className={f.unidadeModo === 'nova' ? 'active' : ''} onClick={() => set('unidadeModo', 'nova')}>Nova unidade</button>
            </div>
            {f.unidadeModo === 'existente' ? (
              <div className="field">
                <label>Unidade de saúde</label>
                <select value={f.objeto_planejamento_id} onChange={(e) => set('objeto_planejamento_id', Number(e.target.value))}>
                  {boot.objetos_planejamento.map((o) => <option key={o.id} value={o.id}>{o.nome} · {o.tipo} · CNES {o.cnes || 'sem CNES'}</option>)}
                </select>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="field">
                    <label>Nome da unidade</label>
                    <input autoFocus value={f.unidadeNova.nome} onChange={(e) => setUnidadeNova('nome', e.target.value)} placeholder="Ex.: Hospital Municipal Novo Rio" />
                  </div>
                  <div className="field">
                    <label>Sigla</label>
                    <input value={f.unidadeNova.sigla} onChange={(e) => setUnidadeNova('sigla', e.target.value)} placeholder="Opcional" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>CNES <span className="muted">(opcional)</span></label>
                    <input value={f.unidadeNova.cnes} onChange={(e) => setUnidadeNova('cnes', e.target.value)} placeholder="Pode ficar em branco" />
                  </div>
                  <div className="field">
                    <label>Tipo de unidade</label>
                    <select value={f.unidadeNova.tipoUnidade} onChange={(e) => setUnidadeNova('tipoUnidade', e.target.value)}>
                      {tiposUnidade.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <Note icon="🏷️">A unidade nova será cadastrada como manual, com AP “Não informada” e fonte “Cadastro manual”.</Note>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="section-title">Configuração</div>
            <div className="field">
              <label>Nome do plano <span className="muted">(opcional)</span></label>
              <input value={f.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Se ficar vazio, o sistema monta um nome automático" />
            </div>
            {f.modo === 'setor' ? (
              <div className="field">
                <label>Descreva o setor</label>
                <input autoFocus value={f.setorTexto} onChange={(e) => set('setorTexto', e.target.value)} placeholder="Ex.: UTI Adulto 20 leitos, centro cirúrgico 6 salas" />
                <div className="hint">A prévia detecta setor, parâmetro principal, fontes e quadro de RH.</div>
              </div>
            ) : f.modo === 'hospital' ? (
              <div className="field">
                <label>Perfil hospitalar</label>
                <select value={f.templateId} onChange={(e) => setTemplate(e.target.value)}>
                  {api.perfisHospitalares.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                <div className="hint">{api.perfisHospitalares.find((t) => t.id === f.templateId)?.descricao}</div>
              </div>
            ) : (
              <div className="field">
                <label>Cronograma pronto</label>
                <select value={f.cronogramaProntoId} onChange={(e) => set('cronogramaProntoId', e.target.value)}>
                  {cronogramasProntos.map((modelo) => <option key={modelo.id} value={modelo.id}>{modelo.nome}</option>)}
                </select>
                <div className="hint">O modelo copia abas de equipe e parametros principais; o cronograma final e recalculado no app.</div>
              </div>
            )}
            <div className="form-row three">
              <div className="field">
                <label>Competência inicial</label>
                <input type="month" value={f.competencia_inicial} onChange={(e) => set('competencia_inicial', e.target.value)} />
              </div>
              <div className="field">
                <label>Meses de projeção</label>
                <input type="number" min={1} max={60} value={f.meses_projecao} onChange={(e) => set('meses_projecao', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Tabela salarial</label>
                <select value={f.tabela_salarial_id} onChange={(e) => set('tabela_salarial_id', Number(e.target.value))}>
                  {boot.tabelas_salariais.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Processo SEI <span className="muted">(opcional)</span></label>
              <input value={f.sei} onChange={(e) => set('sei', e.target.value)} placeholder="Ex.: SEI-080001/004321/2026" />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="spread">
              <div className="section-title" style={{ margin: 0 }}>{f.modo === 'modelo' ? 'Prévia do modelo' : 'Prévia normativa'}</div>
              <div className="flex" style={{ gap: 8 }}>
                <Badge cls="verde" dot>{preview.resumo.setoresAtivos || 0} setor(es)</Badge>
                <Badge cls="azul">Equipe {preview.resumo.equipeTotal || 0}</Badge>
                {f.modo === 'modelo'
                  ? <Badge cls="cinza">{preview.resumo.linhasEquipe || 0} linhas</Badge>
                  : <Badge cls="cinza">QP30 {preview.resumo.qp30Total || 0} · QP40 {preview.resumo.qp40Total || 0}</Badge>}
              </div>
            </div>
            {preview.avisos?.map((aviso, i) => <Note key={i} icon="⚠️">{aviso}</Note>)}
            {f.modo === 'modelo' ? (
              <PreviewCronogramaPronto preview={preview} />
            ) : f.modo === 'setor' ? (
              <PreviewSetor setor={preview.setores[0]} />
            ) : (
              <PreviewHospital setores={preview.setores} setSetor={setSetor} pendenciasJustificativa={pendenciasJustificativa} />
            )}
          </>
        )}

        {step === 4 && (
          <>
            <div className="section-title">Criar cronograma</div>
            <div className="grid cols-2">
              <Resumo k="Tipo" v={f.modo === 'setor' ? 'Setor específico' : f.modo === 'modelo' ? 'Modelo pronto' : 'Hospital/unidade completa'} />
              <Resumo k="Unidade" v={preview.unidade?.nome || '—'} />
              <Resumo k="Competência" v={f.competencia_inicial} />
              <Resumo k="Meses" v={f.meses_projecao} />
              <Resumo k="Setores ativos" v={preview.resumo.setoresAtivos || 0} />
              <Resumo k={f.modo === 'modelo' ? 'Equipe importada' : 'Equipe normativa estimada'} v={preview.resumo.equipeTotal || 0} />
            </div>
            {pendenciasJustificativa.length > 0 && <Note icon="⚠️">Há setor obrigatório desmarcado sem justificativa.</Note>}
            <Note icon="✅">Ao criar, o plano será persistido e abrirá direto na {f.modo === 'modelo' ? 'tela de lançamentos' : 'construção'}. A partir daí, alterações de RH fora da norma exigem justificativa.</Note>
          </>
        )}

        <div className="divider" />
        <div className="spread">
          <button className="btn ghost" onClick={() => (step === 0 ? nav('/planos') : setStep(step - 1))}>
            {step === 0 ? 'Cancelar' : '← Voltar'}
          </button>
          {step < passos.length - 1 ? (
            <button className="btn primary" disabled={!podeAvancar} onClick={() => setStep(step + 1)}>Continuar →</button>
          ) : (
            <button className="btn primary" disabled={!podeCriar} onClick={criar}>{f.modo === 'modelo' ? 'Criar plano e abrir lançamentos' : 'Criar plano e abrir construção'}</button>
          )}
        </div>
      </div>
    </div>
  )
}

function Opcao({ ativo, ico, titulo, texto, onClick }) {
  return (
    <div className={`preset-opt ${ativo ? 'sel' : ''}`} onClick={onClick}>
      <div className="p-ico">{ico}</div>
      <div>
        <h4>{titulo}</h4>
        <p>{texto}</p>
      </div>
    </div>
  )
}

function PreviewSetor({ setor }) {
  if (!setor) return <Note icon="⚠️">Não foi possível reconhecer uma regra estruturada para este texto. O plano poderá ser criado, mas o setor entrará como manual sem RH automático.</Note>
  return (
    <>
      <div className="card card-pad mt-2" style={{ boxShadow: 'none', background: 'var(--cinza-bg)' }}>
        <div className="spread">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Setor reconhecido</div>
            <b>{setor.setor?.setor}</b>
          </div>
          <Badge cls={setor.regras?.length ? 'verde' : 'ambar'}>{setor.regras?.length || 0} regra(s)</Badge>
        </div>
        <div className="memo-line"><span className="k">Entrada detectada</span><span className="v">{setor.quantidade} {setor.unidade}</span></div>
        <div className="memo-line"><span className="k">Fontes</span><span className="v">{setor.fontes?.slice(0, 3).join(' · ') || 'Sem fonte vinculada'}</span></div>
      </div>
      <TabelaPreview linhas={setor.linhas || []} />
    </>
  )
}

function PreviewHospital({ setores, setSetor, pendenciasJustificativa }) {
  return (
    <>
      {pendenciasJustificativa.length > 0 && <Note icon="⚠️">Setores obrigatórios desmarcados precisam de justificativa antes de criar.</Note>}
      <div className="card mt-2">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Ativo</th><th>Setor</th><th>Perfil</th><th className="num">Qtd</th><th>Unidade</th><th className="num">Equipe</th><th>Fonte</th></tr></thead>
            <tbody>
              {setores.map((s) => (
                <tr key={s.slug}>
                  <td><input type="checkbox" checked={s.ativo} onChange={(e) => setSetor(s.slug, { ativo: e.target.checked })} /></td>
                  <td>
                    <b>{s.setor?.setor || s.slug}</b>
                    <div className="hint">{s.setor?.macroarea}</div>
                    {!s.ativo && s.obrigatorio && (
                      <textarea rows={2} value={s.justificativa || ''} onChange={(e) => setSetor(s.slug, { justificativa: e.target.value })}
                        placeholder="Justifique a retirada deste setor obrigatório"
                        style={{ width: '100%', marginTop: 6, padding: '6px 8px', border: '1px solid var(--cinza-borda-forte)', borderRadius: 6, font: 'inherit' }} />
                    )}
                  </td>
                  <td>{s.obrigatorio ? <Badge cls="azul">Obrigatório</Badge> : <Badge>Opcional</Badge>}</td>
                  <td className="num"><input className="cell-input" type="number" min={0} step="1" disabled={!s.ativo} value={s.quantidade} onChange={(e) => setSetor(s.slug, { quantidade: Number(e.target.value) || 0 })} /></td>
                  <td><input className="cell-input" style={{ textAlign: 'left' }} disabled={!s.ativo} value={s.unidade} onChange={(e) => setSetor(s.slug, { unidade: e.target.value })} /></td>
                  <td className="num tnum">{s.ativo ? s.equipeTotal : '—'}</td>
                  <td className="muted">{s.fontes?.[0] || 'Matriz v4'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function PreviewCronogramaPronto({ preview }) {
  const modelo = preview.modelo
  return (
    <>
      <div className="card card-pad mt-2" style={{ boxShadow: 'none', background: 'var(--cinza-bg)' }}>
        <div className="spread">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Modelo selecionado</div>
            <b>{modelo?.nome}</b>
          </div>
          <Badge cls={preview.resumo.linhasRevisao ? 'ambar' : 'verde'}>
            {preview.resumo.linhasRevisao ? `${preview.resumo.linhasRevisao} revisar` : 'Sem revisão'}
          </Badge>
        </div>
        <div className="memo-line"><span className="k">Fonte</span><span className="v">{modelo?.fonte}</span></div>
        <div className="memo-line"><span className="k">Custeio operacional</span><span className="v">{Math.round((modelo?.parametrosCronograma?.custeioOperacionalPct || 0) * 100)}%</span></div>
      </div>
      <div className="card mt-2">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Aba importada</th><th>Setor / serviço</th><th className="num">Linhas</th><th className="num">Equipe</th><th>Revisão</th></tr></thead>
            <tbody>
              {preview.setores.map((setor) => (
                <tr key={setor.id}>
                  <td className="muted">{setor.abaOrigem}</td>
                  <td><b>{setor.nome}</b></td>
                  <td className="num tnum">{setor.linhasEquipe}</td>
                  <td className="num tnum">{setor.profissionais}</td>
                  <td>{setor.revisar ? <Badge cls="ambar" dot>Revisar</Badge> : <Badge cls="verde" dot>Ok</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function TabelaPreview({ linhas }) {
  return (
    <div className="card mt-2">
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Função</th><th>Fonte</th><th className="num">Normativo</th><th className="num">QP 30h</th><th className="num">QP 40h</th><th>CHS</th></tr></thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.regra.id}>
                <td><b>{l.perfil.label}</b></td>
                <td className="muted">{l.fonte}</td>
                <td className="num tnum">{l.qtd}</td>
                <td className="num tnum">{l.qp30}</td>
                <td className="num tnum">{l.qp40}</td>
                <td>{l.chs}h</td>
              </tr>
            ))}
            {!linhas.length && <tr><td colSpan={6} className="muted" style={{ padding: 20, textAlign: 'center' }}>Sem quadro automático.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Resumo({ k, v }) {
  return (
    <div className="stat-line">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  )
}
