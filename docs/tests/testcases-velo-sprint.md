# Documento de Casos de Teste - Velô Sprint

Este documento contém os Casos de Teste baseados nas regras de negócio e no formulário de requisitos do sistema Velô Sprint.

---

### CT01 - Validar carregamento do preço base no Configurador

#### Objetivo
Garantir que o valor base do veículo é carregado corretamente sem opcionais adicionais.

#### Pré-Condições
- Sistema deve estar acessível
- Estar na rota `/configure`

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a página do Configurador | Página carregada sem erros |
| 2  | Visualizar o quadro de "Resumo" | Mostrar opções padrão (Glacier Blue, Aero Wheels) |
| 3  | Verificar o valor Total | O valor exibido deve ser "R$ 40.000,00" |

#### Resultados Esperados
- O preço base do veículo sem nenhum opcional ou roda especial deve ser R$ 40.000,00.

#### Critérios de Aceitação
- Valor total formatado corretamente em BRL.

---

### CT02 - Validar acréscimo de opcionais no preço final

#### Objetivo
Garantir que a escolha de rodas "Sport", "Precision Park" e "Flux Capacitor" some os valores corretos.

#### Pré-Condições
- Estar na rota `/configure` com as opções padrão.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Selecionar rodas "Sport" | Preço deve subir para R$ 42.000,00 |
| 2  | Selecionar opcional "Precision Park" | Preço deve subir para R$ 47.500,00 |
| 3  | Selecionar opcional "Flux Capacitor" | Preço deve subir para R$ 52.500,00 |

#### Resultados Esperados
- O sistema atualiza o "Total" dinamicamente somando a base R$ 40.000 + R$ 2.000 + R$ 5.500 + R$ 5.000.

#### Critérios de Aceitação
- Preço final = R$ 52.500,00.

---

### CT03 - Validar campos obrigatórios no formulário de Checkout

#### Objetivo
Impedir o envio do pedido sem o preenchimento dos dados obrigatórios ou termos de uso.

#### Pré-Condições
- Ter configurado o veículo.
- Estar na rota `/order`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Deixar todos os campos em branco | Campos continuam vazios |
| 2  | Clicar no botão "Confirmar Pedido" | Mensagens de erro de validação (Zod) aparecem sob os inputs |
| 3  | Verificar erros exibidos | Erros para Nome, Sobrenome, Email, Telefone, CPF, Loja e Aceite de Termos |

#### Resultados Esperados
- O sistema não cria o pedido e exibe alertas nos campos falhos informando a necessidade de preenchimento.

#### Critérios de Aceitação
- Bloqueio de submissão do formulário.

---

### CT04 - Fluxo Feliz: Pedido "À Vista" com dados válidos

#### Objetivo
Validar a criação de um pedido à vista (sem análise de crédito).

#### Pré-Condições
- Configuração de veículo de R$ 40.000,00 concluída.
- Estar na rota `/order`.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Preencher dados pessoais válidos (Nome, Email, CPF...) | Dados inseridos no form |
| 2  | Selecionar "À Vista" em Forma de Pagamento | Botão fica destacado |
| 3  | Marcar o checkbox de "Termos de Uso" | Checkbox marcado |
| 4  | Clicar em "Confirmar Pedido" | Redirecionamento para `/success` |

#### Resultados Esperados
- Pedido salvo com sucesso com o status `APROVADO`.

#### Critérios de Aceitação
- Exibição da página de Sucesso e do `order_number`.

---

### CT05 - Cálculo de parcelas de Financiamento (sem entrada)

#### Objetivo
Validar a aplicação de juros de 2% sobre o saldo financiado em 12x.

#### Pré-Condições
- Configuração de veículo em R$ 40.000,00.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Preencher dados válidos no Checkout | Form preenchido |
| 2  | Selecionar "Financiamento" | Campo de Entrada e resumo financeiro exibidos |
| 3  | Deixar a entrada em R$ 0,00 | Sistema atualiza o resumo |
| 4  | Conferir o cálculo da parcela | A parcela deve exibir R$ 3.400,00 (40.000 / 12 * 1.02) |

#### Resultados Esperados
- O valor da parcela e o total financiado (R$ 40.800,00) são calculados usando juros corretos.

#### Critérios de Aceitação
- A matemática bate precisamente com a regra descrita.

---

### CT06 - Cálculo de parcelas com Entrada

#### Objetivo
Validar que a entrada abate o saldo devedor antes de aplicar os juros.

#### Pré-Condições
- Configuração de veículo em R$ 40.000,00.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Selecionar "Financiamento" | Exibe resumo financeiro |
| 2  | Inserir "10000" no valor da Entrada | O "Valor a financiar" passa a ser R$ 30.000,00 |
| 3  | Conferir o cálculo da parcela | A parcela deve exibir R$ 2.550,00 (30.000 / 12 * 1.02) |

#### Resultados Esperados
- Parcela recalculada dinamicamente baseada na subtração da entrada.

#### Critérios de Aceitação
- Valor total financiado será R$ 30.600,00.

---

### CT07 - Análise de Crédito: Aprovação automática por Score (> 700)

#### Objetivo
Validar aprovação direta quando o score for alto, mesmo financiando sem entrada.

#### Pré-Condições
- O mock/API de Score retornará um valor > 700 (ex: 750) para o CPF informado.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Escolher Financiamento com R$ 0 de entrada | Resumo atualizado |
| 2  | Informar CPF associado ao Score alto | - |
| 3  | Confirmar pedido | Pedido gerado |

#### Resultados Esperados
- O sistema recebe score > 700 e define o status do pedido como `APROVADO`.

#### Critérios de Aceitação
- Tela de sucesso exibe o status de pedido finalizado e aprovado.

---

### CT08 - Análise de Crédito: Exceção da Entrada Alta (>= 50%)

#### Objetivo
Garantir que uma entrada de 50% ou mais ignora um score de crédito reprovado (< 700).

#### Pré-Condições
- Valor do carro configurado para R$ 40.000,00.
- Mock/API de Score retornando valor reprovado (ex: 300).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Selecionar Financiamento | - |
| 2  | Informar entrada de R$ 20.000,00 | Resumo é atualizado |
| 3  | Inserir CPF de teste (score 300) | - |
| 4  | Confirmar Pedido | Pedido avança para tela de Sucesso |

#### Resultados Esperados
- Apesar do score ser 300, como a entrada é >= 50% do total da compra, a regra de negócio determina aprovação. O pedido terá status `APROVADO`.

#### Critérios de Aceitação
- Regra de negócio respeitada.

---

### CT09 - Análise de Crédito: Em Análise (Score 501-700)

#### Objetivo
Validar que scores medianos ativam o status "EM_ANALISE".

#### Pré-Condições
- Mock/API retornando Score entre 501 e 700 (ex: 600).
- Entrada < 50%.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Inserir dados no checkout com CPF de score mediano | Dados preenchidos |
| 2  | Solicitar financiamento com entrada R$ 0 | - |
| 3  | Confirmar pedido | Pedido gerado |

#### Resultados Esperados
- O pedido terá o status setado no banco de dados para `EM_ANALISE`.

#### Critérios de Aceitação
- Fluxo concluído sem falhas, mas com status `EM_ANALISE`.

---

### CT10 - Análise de Crédito: Reprovado (Score <= 500)

#### Objetivo
Validar que o financiamento é bloqueado/reprovado se o score for muito baixo e a entrada pequena.

#### Pré-Condições
- Mock/API retornando Score <= 500 (ex: 499).
- Entrada < 50%.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Inserir dados no checkout com CPF de score baixo | Dados preenchidos |
| 2  | Solicitar financiamento com entrada R$ 0 | - |
| 3  | Confirmar pedido | Pedido gerado mas como reprovado |

#### Resultados Esperados
- O pedido terá o status setado para `REPROVADO`.

#### Critérios de Aceitação
- Banco de dados reflete status REPROVADO.

---

### CT11 - Consulta de Pedido Autorizada (Happy Path)

#### Objetivo
Verificar a regra de segurança onde o número do pedido e um dado de cliente combinam.

#### Pré-Condições
- Ter um número de pedido real gerado (ex: `12345`).
- Ter o email correto do cliente gerador do pedido (`teste@velo.com`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a tela de Consulta de Pedido | Formulário de consulta visível |
| 2  | Inserir `12345` no campo Order Number | - |
| 3  | Inserir `teste@velo.com` no campo de segurança (Email/CPF) | - |
| 4  | Clicar em Buscar | A tela de detalhes do pedido é renderizada |

#### Resultados Esperados
- Exibição completa das informações do carro, loja e status financeiro.

#### Critérios de Aceitação
- Acesso liberado apenas com combinação válida.

---

### CT12 - Consulta de Pedido Negada - Dado incorreto (Negative Path)

#### Objetivo
Impedir o acesso de terceiros (não autorizados) às informações do pedido.

#### Pré-Condições
- Ter um número de pedido real gerado (ex: `12345`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar tela de Consulta de Pedido | Formulário visível |
| 2  | Inserir `12345` no campo Order Number | - |
| 3  | Inserir `email_errado@velo.com` | - |
| 4  | Clicar em Buscar | Sistema exibe mensagem de erro |

#### Resultados Esperados
- O sistema bloqueia o acesso, exibindo um erro informando "Pedido não encontrado ou dados não conferem". Os dados do pedido não são expostos.

#### Critérios de Aceitação
- Nenhuma informação vaza em caso de erro na autenticação da consulta.
