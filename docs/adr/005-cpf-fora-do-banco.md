# ADR 005 — CPF fora do banco

- **Status:** Aceita (implementação na Etapa 6)
- **Data:** 2026-11-12
- **Origem:** SPEC §7 "Pagamento" e data-model §5

## Contexto

O Asaas exige CPF para criar o cliente e cobrar. CPF é dado pessoal (LGPD): guardar aumenta o estrago de um vazamento e a responsabilidade do projeto.

## Decisão

O CPF é pedido **só no primeiro checkout** e enviado direto ao Asaas para criar o cliente. O banco guarda apenas o `asaasCustomerId`, reutilizado nas compras seguintes. O CPF **nunca aparece em logs**.

## Alternativas consideradas

- **Guardar o CPF, mesmo criptografado:** facilitaria recriar o cliente no Asaas, mas mantém o dado sensível no banco e exige gestão de chave de criptografia.
- **Pedir o CPF em toda compra:** nada é guardado, mas cria atrito no checkout sem necessidade, já que o Asaas mantém o cliente.

## Consequências

- **Ganha:** um vazamento do banco não expõe CPFs; menos obrigações de LGPD; checkout mais curto a partir da segunda compra.
- **Perde:** se o cliente for apagado no Asaas, o CPF precisa ser pedido de novo; cuidado contínuo para não registrar o CPF em logs ou mensagens de erro.
