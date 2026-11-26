# ADR 012 — Taxa de entrega por cidade

- **Status:** Aceita (implementação na Etapa 5)
- **Data:** 2026-11-26
- **Origem:** SPEC §6 (Entrega e retirada)

## Contexto

O SPEC previa a taxa de entrega **por bairro**, com uma tabela de bairros atendidos. A área de entrega combinada é a **cidade de São Paulo e as 7 cidades do ABC** (Santo André, São Bernardo do Campo, São Caetano do Sul, Diadema, Mauá, Ribeirão Pires e Rio Grande da Serra). Isso dá centenas de bairros, e o nome que o ViaCEP devolve nem sempre bate com o nome cadastrado (acentos, abreviações, loteamentos). Com a taxa por bairro, um cliente dentro da área seria recusado só por grafia, e o admin teria uma lista enorme para manter.

## Decisão

A taxa é **por cidade**. Uma tabela `DeliveryCity` (nome, UF, taxa em centavos, ativa) guarda as cidades atendidas.

- O **servidor** consulta o CEP no ViaCEP e procura a cidade e a UF devolvidas, comparando sem acento e sem maiúscula. A cidade enviada pela tela nunca é usada.
- Cidade fora da tabela, ou desativada, significa **fora da área**: o endereço não é salvo e a tela oferece a retirada no balcão.
- O endereço salvo guarda o bairro, a cidade e a UF como vieram (snapshot para o pedido) e aponta para a `DeliveryCity`, que define a taxa.

## Alternativas consideradas

- **Por bairro (plano original):** preço mais fino, mas recusa clientes por grafia e exige uma lista grande. Não compensa sem um painel de mapa.
- **Por distância (raio em km):** mais justo, mas precisa geocodificar o endereço (serviço pago ou com cota) e explicar ao cliente por que a taxa mudou entre vizinhos.
- **Por faixa de CEP:** preciso, mas difícil de manter e de explicar.

## Consequências

- **Ganha:** regra simples, testável e fácil de explicar ("entrega em Santo André: R$ 10,00"); ninguém dentro da área é recusado por grafia; o admin cuida de 8 linhas.
- **Perde:** a taxa é a mesma para toda a cidade de São Paulo, perto ou longe da loja. Se a loja quiser cobrar por zona dentro da capital, criar faixas por região ou por distância num ADR novo, atrás da mesma regra do `deliveryService`.
