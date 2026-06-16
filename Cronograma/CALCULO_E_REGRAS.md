# Calculo, regras e cenarios

## Visao geral

O motor v1 fica em `plano_trabalho/services/calculo.py`.

Ele executa quatro operacoes principais:

- `validar_plano(plano)`;
- `simular_plano(plano, variante_ids=None)`;
- `apurar_plano(plano, variante_ids=None)`;
- `gerar_cronograma(plano, apuracao_id=None, variante_ids=None)`.

Tambem fecha planos com `fechar_plano(plano)`.

## Contexto de cenario

`resolver_cenario()` produz um `ContextoCenario` com:

- plano;
- variante/cenario efetivo;
- conjunto de regras efetivo;
- composicao normativa efetiva;
- tabela salarial efetiva;
- configuracao global efetiva;
- cadeia de cenarios herdados.

Resolucao:

1. seleciona cenario informado ou cenario padrao ativo;
2. valida que o cenario pertence ao plano;
3. parte das FKs do plano;
4. percorre `cenario_base` ate o cenario atual;
5. aplica overrides de conjunto, composicao, tabela salarial e configuracao global.

## Composicao normativa

Quando `composicao_conjuntos` esta preenchida, ela tem precedencia sobre `conjunto_regras`.

`resolver_conjuntos_regras()` retorna conjuntos ativos em ordem de aplicacao. Se duas regras do mesmo tipo aparecem com o mesmo `codigo`, o motor usa a primeira e registra as demais como duplicidade tecnica na memoria de calculo.

## Overlays por cenario

Itens operacionais seguem o mesmo padrao:

- item comum: `variante_plano = NULL`;
- item ativo no cenario: sobrescreve item comum pela chave natural;
- item inativo no cenario: remove item herdado;
- item herdado de `cenario_base`: entra antes dos overrides do cenario atual.

Chaves naturais usadas:

| Model | Chave de overlay |
| --- | --- |
| `ValorVariavelPlano` | `definicao_variavel_id` |
| `ItemQuadroEscopo` | `perfil_alocacao_id` |
| `ComponenteCusteioEscopo` | `codigo` |
| `ProcedimentoEscopo` | `codigo` |
| `CalendarioOperacionalEscopo` | competencia/recorte operacional |

## Regras de quadro

`RegraQuadroPessoal` dimensiona um `PerfilAlocacao` para um `TipoSetor`.

Estrategias v1:

- `proporcional`: usa uma variavel base e fator de proporcao;
- `minimo_fixo`: retorna quantidade minima fixa;
- `por_faixa`: escolhe faixa de acordo com variavel base;
- `formula`: nao executada pelo motor v1.

Arredondamentos:

- para cima;
- para baixo;
- matematico;
- sem arredondamento.

Condições (`CondicaoRegraQuadroPessoal`) filtram elegibilidade. Condicao nao satisfeita impede aplicacao da regra.

## Regras de rubrica

`RegraRubrica` gera custos financeiros.

Estrategias v1:

- `valor_fixo`;
- `percentual_sobre_base`;
- `valor_por_quantidade`;
- `formula`.

Formula personalizada:

- se obrigatoria, bloqueia apuracao com erro claro;
- se opcional, e ignorada e registrada como aviso.

Niveis de aplicacao podem atuar sobre posicao, escopo ou base financeira, conforme os campos da regra.

## Parametros de rubrica por cenario

`ParametroRubricaVariantePlano` permite ajustar rubricas por cenario, por `Rubrica` ou por `GrupoRubrica`.

Uso comum:

- cenario `Com CEBAS` zerar encargos especificos;
- cenario alternativo testar beneficios, provisoes ou percentuais;
- cenario de negociacao ajustar custeio sem mudar a base normativa global.

## Checklist de completude

`services/completude.py` calcula variaveis exigidas por:

- regras de quadro ativas que usam `variavel_base` aplicavel ao plano;
- condicoes ativas de regras;
- regras de rubrica com `definicao_variavel_base`;
- compatibilidades obrigatorias de `TipoSetor` para cada no calculavel.

Retorno:

- resumo agregado;
- blocos por escopo;
- variaveis faltantes;
- variaveis preenchidas;
- percentual de completude.

## Simulacao

`simular_plano()` calcula em memoria e retorna payload serializavel.

Use quando:

- o usuario quer comparar cenarios;
- o frontend precisa previsualizar impacto;
- nao ha decisao de persistir resultado.

Simulacao nao cria `ApuracaoPlano` nem registros de resultado.

## Apuracao

`apurar_plano()` cria uma execucao persistida.

Saidas criadas:

- `ApuracaoPlano`;
- `PosicaoPlanejada`;
- `ResultadoProducaoEscopo`;
- `ItemCustoApurado`;
- `ItemCustoMensalApurado`;
- `ConsolidadoResultadoEscopo`;
- `ConsolidadoResultadoMensalEscopo`.

Campos JSON de memoria de calculo guardam avisos, regras usadas, duplicidades tecnicas e detalhes suficientes para rastrear o resultado.

## Cronograma

`gerar_cronograma()` usa `ConsolidadoResultadoMensalEscopo`.

O cronograma cria:

- `CronogramaFinanceiro`;
- `BlocoCronograma`;
- `ParcelaCronograma`.

Na v1, os blocos principais sao:

- pessoal por setor;
- custeio operacional.

Importante: cronograma nao reinterpreta regras. Ele distribui temporalmente uma saida mensal ja apurada.

## Fechamento

`fechar_plano()` marca o plano como `fechado` quando as condicoes de negocio sao satisfeitas e fecha cronogramas ativos.

Um plano fechado pode ser arquivado, mas nao deve ser tratado como configuracao livre.

## Erros esperados

| Situacao | Resultado esperado |
| --- | --- |
| Plano sem cenario ativo | `ValidationError` sobre cenarios. |
| Cenario de outro plano | `ValidationError` sobre cenario. |
| Formula obrigatoria | Bloqueia apuracao. |
| Formula opcional | Gera aviso e segue. |
| Variavel obrigatoria sem valor | Deve aparecer em completude e pode impedir prontidao conforme validacao. |
| Tabela salarial sem item para perfil | Custo salarial pode ficar incompleto ou gerar aviso. |
| Regra duplicada por codigo | Primeira regra vence; duplicidade entra na memoria. |

## Checklist para alterar calculo

- Preserve `simular` sem persistencia.
- Garanta que `apurar` limpe ou isole resultados da execucao que esta criando.
- Mantenha compatibilidade com `cenario_ids` e `variante_ids`.
- Atualize serializers ou docs de API quando o payload mudar.
- Atualize testes de models e API.
- Verifique cronograma se mudar consolidados mensais.
- Documente novas estrategias de regra antes de disponibilizar no catalogo.
