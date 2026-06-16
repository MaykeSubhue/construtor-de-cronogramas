# Auditoria, proveniencia e bases vinculadas

## Objetivo

O app diferencia dados vindos de carga padrao, cadastro manual, importacao e copia. Isso evita que uma edicao operacional apague a origem do dado e ajuda o usuario a entender quando uma base foi herdada ou customizada.

## Models envolvidos

| Model | Papel |
| --- | --- |
| `RegistroProvenancia` | Metadados de origem de qualquer registro alvo via `GenericForeignKey`. |
| `LogAuditoriaCatalogo` | Evento append-only de criacao, edicao, desativacao ou reativacao. |
| `PlanoBaseVinculada` | Vinculo de primeira classe entre plano e base normativa/salarial. |
| `PapelBase` | Enum dos papeis de base: `regras` e `salarial`. |
| `EstadoVinculoBase` | Enum do estado do vinculo: `herdado`, `customizado`, `copiado`. |

## Proveniencia

`RegistroProvenancia` guarda:

- objeto alvo;
- origem (`seed`, `usuario`, `importacao`, `copia`);
- se foi customizado;
- usuario e data da customizacao.

Ao criar registro via catalogo editavel, a API chama `garantir_provenancia(instance)`.

Ao editar item herdado, a politica atual exige justificativa.

## Log de auditoria

`LogAuditoriaCatalogo` registra eventos append-only com:

- acao;
- catalogo;
- autor;
- snapshot antes;
- snapshot depois;
- campos alterados;
- justificativa.

Eventos de catalogo sao expostos por:

```text
GET /plano-trabalho/api/catalogos/{catalogo}/{id}/historico/
```

## Bases vinculadas

`PlanoTrabalho` ainda usa FKs diretas como fonte de verdade operacional:

- `conjunto_regras`;
- `tabela_salarial`.

`PlanoBaseVinculada` e uma projecao lateral para UI e auditoria. O sincronizador sempre considera a FK como fonte de verdade.

Endpoints:

```text
GET  /plano-trabalho/api/planos/{id}/bases/
POST /plano-trabalho/api/planos/{id}/bases/{papel}/
GET  /plano-trabalho/api/planos/{id}/bases-historico/
```

## Papeis de base

| Papel | Base concreta |
| --- | --- |
| `regras` | `ConjuntoRegras` |
| `salarial` | `TabelaSalarial` |

## Estados de vinculo

| Estado | Significado |
| --- | --- |
| `herdado` | O plano consome a base como ela esta; mudancas futuras na base podem refletir no plano. |
| `customizado` | O plano recebeu overrides ou excecoes locais. |
| `copiado` | Reservado para snapshot independente futuro. |

## Substituicao de base

Payload:

```json
{
  "base_id": 2,
  "justificativa": "Atualizacao de referencia normativa."
}
```

Regras:

- `papel` deve ser `regras` ou `salarial`;
- `base_id` precisa apontar para base ativa do tipo correto;
- justificativa e obrigatoria se o plano nao estiver em `rascunho`;
- a FK do plano e atualizada;
- o signal/helper recria ou sincroniza o `PlanoBaseVinculada` como `herdado`;
- um evento de auditoria e registrado no proprio `PlanoTrabalho`.

## Quando marcar como customizado

Marque base como `customizado` quando o plano deixa de refletir a base pura por causa de uma decisao local, por exemplo:

- override de regras em cenario;
- item de quadro manual que contraria regra aplicavel;
- componente de custeio local que substitui rubrica padrao;
- tabela ou regra trocada em cenario especifico.

O helper disponivel e:

```python
from plano_trabalho.services.bases_vinculadas import marcar_customizado
```

## Cuidados ao manter auditoria

- Nao sobrescreva registros de log; crie novo evento.
- Nao remova proveniencia de itens seedados.
- Ao adicionar catalogo editavel, inclua campos auditaveis em `CATALOGO_CONFIGS`.
- Ao criar endpoint de escrita em catalogo, registre evento com antes/depois.
- Ao alterar base de plano, passe pelo service ou endpoint que sincroniza `PlanoBaseVinculada`.
