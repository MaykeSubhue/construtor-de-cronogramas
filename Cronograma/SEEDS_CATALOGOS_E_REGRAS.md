# Catalogos, regras e seed do `plano_trabalho`

Este documento resume o conteudo semeado para catalogos e regras. Para o uso operacional do comando, consulte [SEEDS.md](./SEEDS.md).

## Comando recomendado

```pwsh
python manage.py seed_plano_trabalho
```

Comando de validacao:

```pwsh
python manage.py seed_plano_trabalho --somente-validar
```

Nomes antigos como `seed_realista_rj` e `seed_catalogos_regras_salarios` sao historicos e nao correspondem a arquivos de comando presentes na arvore atual.

## Catalogos estruturais

Arquivo-fonte:

- `plano_trabalho/seeds/bases_catalogos.py`

Modelos cobertos:

- `TipoNoEstrutura`;
- `TipoSetor`;
- `CategoriaProfissional`;
- `RegimeTrabalho`;
- `NaturezaAtuacao`;
- `PerfilAlocacao`.

Esses catalogos definem:

- como a arvore do plano pode ser organizada;
- que tipos de area existem;
- quais categorias e regimes podem compor postos;
- quais perfis de alocacao podem receber salario e regra de quadro.

## Catalogos financeiros

Arquivo-fonte:

- `plano_trabalho/seeds/bases_rubricas.py`

Modelos cobertos:

- `GrupoRubrica`;
- `Rubrica`.

O seed inclui grupos para:

- remuneracao;
- beneficios;
- encargos sociais;
- provisoes trabalhistas;
- custeio operacional;
- tributos e rateios.

## Variaveis e compatibilidades

Arquivo-fonte:

- `plano_trabalho/seeds/bases_variaveis.py`

Modelos cobertos:

- `DefinicaoVariavel`;
- `CompatibilidadeTipoSetorVariavel`.

As variaveis cobrem familias como:

- capacidade fisica;
- producao;
- parametros globais;
- indices operacionais;
- classificacao assistencial.

Compatibilidades determinam quais variaveis sao obrigatorias ou opcionais em cada `TipoSetor`.

## Conjuntos normativos

Arquivo-fonte:

- `plano_trabalho/seeds/bases_normativas.py`

Modelo principal:

- `ConjuntoRegras`.

Cada conjunto agrupa regras de quadro ou rubricas com referencia normativa, vigencia, observacoes e origem.

Quando varias bases precisam atuar juntas, use `ComposicaoConjuntoRegras` no plano ou no cenario.

## Regras de quadro

Modelos:

- `RegraQuadroPessoal`;
- `CondicaoRegraQuadroPessoal`;
- `FaixaRegraQuadroPessoal`.

Estrategias suportadas:

- `proporcional`;
- `minimo_fixo`;
- `por_faixa`;
- `formula`.

`formula` ainda nao e executada pelo motor v1. Regras obrigatorias com formula bloqueiam apuracao; opcionais geram aviso.

## Regras de rubrica

Modelos:

- `RegraRubrica`;
- `CondicaoRegraRubrica`;
- `ParametroRubricaVariantePlano`.

Estrategias suportadas:

- `valor_fixo`;
- `percentual_sobre_base`;
- `valor_por_quantidade`;
- `formula`.

Parametros por cenario permitem ajustar ou zerar rubricas em cenarios como `Com CEBAS`.

## Tabelas salariais

Arquivo-fonte:

- `plano_trabalho/seeds/bases_salarios.py`

Modelos:

- `TabelaSalarial`;
- `ItemTabelaSalarial`.

Itens salariais apontam para `PerfilAlocacao`, nao para categoria isolada.

## Plano demonstravel

Arquivo-fonte:

- `plano_trabalho/seeds/bases_arquetipos.py`

Quando habilitado, o seed cria um plano demonstravel com:

- objeto de planejamento;
- estrutura operacional;
- escopos;
- cenarios;
- parametros;
- quadro;
- producao;
- custeio;
- calendario.

## Proveniencia e idempotencia

O helper de seed:

- evita duplicacao por chaves estaveis;
- chama validacao antes de salvar;
- registra contadores de criados/atualizados;
- marca origem em descricoes e observacoes.

Use o resumo final para confirmar se uma segunda execucao esta atualizando registros em vez de recria-los.

## Checklist ao adicionar um novo catalogo ou regra

- Defina codigo tecnico estavel.
- Inclua descricao e origem.
- Verifique se existe serializer e UI de catalogo quando for editavel.
- Inclua compatibilidades quando a regra depender de variaveis por setor.
- Rode `--dry-run`.
- Rode `--somente-validar`.
- Atualize [CALCULO_E_REGRAS.md](./CALCULO_E_REGRAS.md) se a nova regra alterar comportamento do motor.
