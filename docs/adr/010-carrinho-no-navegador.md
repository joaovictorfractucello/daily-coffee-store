# ADR 010 — Carrinho no navegador, checkout recalculado no servidor

- **Status:** Aceita (implementação na Etapa 3)
- **Data:** 2026-11-17
- **Origem:** SPEC §3 (Regras do carrinho)

## Contexto

O carrinho precisa funcionar sem login. Guardá-lo no servidor exigiria linhas no banco para visitantes e um identificador para quem não tem conta. O risco de fraude (o usuário editar preço ou quantidade) preocupa mais do que o lugar onde a lista fica guardada.

## Decisão

O carrinho fica no **navegador** (Zustand com persistência no localStorage) e guarda só `productId` e `quantity`, sem preço nem nome. Nome, foto e preço atuais vêm do servidor, por uma consulta que também confere se o produto continua ativo.

O carrinho é só uma lista de desejos. Na finalização o servidor recebe apenas IDs e quantidades, busca os preços no banco, confere produto ativo e quantidade (inteira, de 1 a 99), e calcula subtotal, taxa de entrega e total sozinho.

O acesso ao carrinho fica atrás de uma camada própria (`cartStore`), para trocar a origem dos dados sem mexer nas telas.

## Alternativas consideradas

- **Carrinho só no servidor (tabela `Cart`):** sincroniza entre dispositivos e permite e-mail de carrinho abandonado, mas exige identificar o visitante sem login e gasta banco com carrinhos que nunca viram pedido.
- **Híbrido (visitante no navegador, logado no servidor):** é o padrão de mercado e é o destino natural se o projeto crescer. Fica para quando houver necessidade real.

## Consequências

- **Ganha:** simples; sem banco para visitante; nenhuma confiança no front-end, porque o preço nunca vem do navegador.
- **Perde:** o carrinho não acompanha o usuário entre dispositivos e não há aviso de carrinho abandonado.
- **Preço pode mudar:** se o preço mudou desde que o item entrou no carrinho, o servidor cobra o novo e a tela avisa a diferença antes do pagamento.

## Se for migrar para o servidor

Vale a pena quando surgir multi-dispositivo ou notificação de carrinho abandonado. Mudaria:

- Tabelas `Cart` e `CartItem` ligadas a `userId`, e rotas `GET` e `PUT /api/cart`.
- O `cartStore` passa a sincronizar com a API.
- **Merge no login:** o carrinho do navegador é juntado ao da conta. Regra a definir (somar ou manter a maior quantidade quando o mesmo produto está nos dois) e testar.

Não mudam: o checkout, as regras de preço e quantidade e a tela do carrinho. Nesse caso, criar um novo ADR que substitui este.
