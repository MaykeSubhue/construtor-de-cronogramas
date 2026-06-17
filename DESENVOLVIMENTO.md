# Desenvolvimento e manutencao

## Rotina basica

Depois de mudar models, services, serializers ou views:

```pwsh
python manage.py check
python manage.py test plano_trabalho
```

Quando a mudanca envolver seed:

```pwsh
python manage.py seed_plano_trabalho --dry-run
python manage.py seed_plano_trabalho --somente-validar
```

Quando a mudanca envolver frontend:

```pwsh
cd plano_trabalho/front
npm install
npm run build
```

O template Django espera o manifest Vite em:

```text
plano_trabalho/static/plano_trabalho/front/.vite/manifest.json
```

Em desenvolvimento, o service aceita `PLANO_TRABALHO_VITE_DEV_SERVER` quando `DEBUG` esta ativo.

## Onde mudar cada coisa

| Mudanca | Local preferencial |
| --- | --- |
| Novo campo persistido | Model + migration + serializer/API/docs. |
| Nova regra de dominio local | `clean()` da model, se for invariante local. |
| Nova regra operacional com varias consultas | Service. |
| Novo endpoint | `urls.py`, `views.py`, serializer e docs de API. |
| Novo campo da tela de setor | `build_setor_configuracao_payload` e `SetorConfiguracaoUpdateSerializer`. |
| Nova estrategia de regra | `models/regras.py`, `services/calculo.py`, catalogo UI e docs de calculo. |
| Novo catalogo editavel | `CATALOGO_CONFIGS`, serializer de catalogo, auditoria e docs de API. |
| Novo dado seedado | Modulo `seeds/bases_*` adequado. |

## Checklist para models

- Chame `super().clean()` em subclasses.
- Preserve `ativo` quando a exclusao deve ser logica.
- Use constraints e indices quando a regra for estavel no banco.
- Valide pertencimento ao mesmo plano quando houver relacoes entre plano, cenario, no e escopo.
- Normalize competencias mensais para o primeiro dia do mes.
- Evite regra que dependa de consultas grandes dentro de `clean()`.

## Checklist para API

- Confirme que endpoint exige autenticacao.
- Use serializer para payload de entrada.
- Resolva apenas objetos ativos quando a operacao nao deve aceitar historicos.
- Retorne HTTP 400 para erro de dominio recuperavel.
- Mantenha aliases existentes (`cenario_id` e `variante_id`) quando alterar endpoints usados pelo frontend.
- Atualize [API.md](./API.md).

## Checklist para services de calculo

- `simular_plano()` nao deve persistir.
- `apurar_plano()` deve gerar saidas rastreaveis por `ApuracaoPlano`.
- `gerar_cronograma()` deve ler consolidados mensais, nao recalcular regra.
- Mantenha memoria de calculo suficiente para explicar o resultado.
- Preserve tratamento de formulas personalizadas nao suportadas.
- Reavalie duplicidades tecnicas quando mudar composicao normativa.

## Checklist para frontend

- Use `/api/bootstrap/` para opcoes iniciais.
- Use `/api/planos/{id}/estrutura/` como fonte da arvore.
- Use `/api/planos/{id}/estrutura/nos/{no_id}/configuracao/` como fonte da tela de setor.
- Nao tente reconstruir regra de overlay no cliente; consuma `origem`, `origem_regra` e `regras_aplicaveis`.
- Rode build antes de depender do bundle estatico.

## Checklist para seed

- Altere listas no modulo `bases_*`, nao no comando.
- Mantenha chaves tecnicas estaveis.
- Rode `--dry-run`.
- Rode `--somente-validar`.
- Revise alertas de cobertura.
- Atualize docs se adicionar nova area, regra, flag ou etapa.

## Riscos comuns

| Risco | Como evitar |
| --- | --- |
| Plano com cenario de outro plano | Validar pertencimento no serializer/service. |
| Item de cenario nao bloqueia heranca | Criar registro inativo para bloqueio explicito. |
| Cronograma divergente da apuracao | Gerar cronograma apenas a partir de consolidados mensais. |
| Catalogo herdado editado sem rastreio | Exigir justificativa e registrar evento. |
| Seed aponta para comando inexistente | Conferir `management/commands/*.py`; nome do comando e o nome do arquivo. |
| Front quebra por shape de payload | Atualizar serializer, docs e testes de API juntos. |

## Testes existentes

O app possui testes em:

- `plano_trabalho/tests/test_models.py`;
- `plano_trabalho/tests/test_frontend_api.py`.

Use-os como base ao mexer em:

- invariantes de models;
- criacao e edicao de planos;
- estrutura e configuracao operacional;
- endpoints do frontend.
