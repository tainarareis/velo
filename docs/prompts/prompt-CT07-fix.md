## Análise de Inconsistência de Status na Página de Sucesso

Atue como um Desenvolvedor Sênior e realize uma análise detalhada da página de sucesso responsável por exibir o status do pedido.

### Contexto
- Cenário **CT07**: quando o cliente envia uma proposta com score entre **501 e 700**.
- No banco de dados, o status do pedido está corretamente definido como **"Em_ANALISE"**.
- Porém, na interface (página de sucesso), o status exibido é "Crédito Reprovado".

### Objetivos
1. Investigar a causa da inconsistência entre o status persistido no banco e o status apresentado na UI.
2. Identificar possíveis problemas na camada de integração, mapeamento de status ou lógica de exibição.
3. Validar se há regras condicionais incorretas para o cenário CT07.

### Entrega Esperada
- Diagnóstico técnico claro do problema.
- Hipótese(s) da causa raiz.
- Proposta de correção detalhada (incluindo sugestão de código ou ajuste lógico, se aplicável).
- Avaliação de impacto da correção em outros cenários.

> Apresente a proposta de solução para minha aprovação antes da implementação.