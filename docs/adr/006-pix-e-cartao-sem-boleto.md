# ADR 006 — Pix e cartão, sem boleto

- **Status:** Aceita (implementação na Etapa 6)
- **Data:** 2026-11-12
- **Origem:** SPEC §7 "Pagamento"

## Contexto

O pedido de uma cafeteria (bebida, salgado) é preparado e entregue no mesmo dia. A confirmação do pagamento precisa chegar em minutos.

## Decisão

Formas de pagamento: **Pix** e **cartão de crédito**, pelo Asaas (sandbox). Sem boleto. O cartão é digitado na página do Asaas, nunca no nosso servidor (padrão PCI). A confirmação vem **sempre pelo webhook** do Asaas, que é idempotente.

## Alternativas consideradas

- **Incluir boleto:** amplia o público, mas leva até três dias úteis para compensar; o pedido ficaria parado e o produto não espera.
- **Formulário de cartão no próprio site:** experiência mais integrada, mas os dados passariam pelo nosso servidor e trariam obrigações de PCI que o projeto não precisa ter.

## Consequências

- **Ganha:** confirmação rápida (Pix em segundos), menos estados de pedido para tratar, nenhum dado de cartão sob nossa responsabilidade.
- **Perde:** quem só paga com boleto não compra; o cliente sai do site para pagar com cartão.
