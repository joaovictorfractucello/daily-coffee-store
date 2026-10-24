# Modelo de dados — Daily Coffee
 
> Local no repositório: `docs/data-model.md`.
> Referência para o `schema.prisma`. Toda mudança no schema deve ser refletida aqui.
 
---
 
## 1. Princípios
 
1. **Dinheiro em centavos (inteiro).** `R$ 14,00` = `1400`. Evita erros de arredondamento de números decimais. A formatação em reais acontece só na interface.
2. **Snapshot no pedido.** Nome e preço do produto, endereço e telefone são **copiados** para o pedido no momento da compra. Mudanças futuras no produto ou no cadastro não alteram pedidos antigos.
3. **Produtos não são apagados.** São desativados (`isActive = false`), porque pedidos antigos apontam para eles (*soft delete*).
4. **Tokens salvos com hash.** Sessões e tokens de e-mail guardam apenas o hash. Um vazamento do banco não permite usar os tokens.
5. **Webhook idempotente.** Cada evento do Asaas é registrado pelo ID; eventos repetidos são ignorados.
6. **Mínimo de dados pessoais.** CPF **não** é armazenado no banco (ver seção 5).
---
 
## 2. Enums
 
| Enum | Valores |
|---|---|
| `Role` | `CUSTOMER`, `ADMIN`, `DEMO_ADMIN` |
| `EmailTokenType` | `EMAIL_VERIFICATION`, `PASSWORD_RESET` |
| `ProductCategory` | `CAFES`, `BEBIDAS_GELADAS`, `SALGADOS`, `DOCES` |
| `FulfillmentType` | `DELIVERY`, `PICKUP` |
| `OrderStatus` | `AWAITING_PAYMENT`, `PAID`, `PREPARING`, `OUT_FOR_DELIVERY`, `READY_FOR_PICKUP`, `DELIVERED`, `CANCELLED` |
| `PaymentMethod` | `PIX`, `CREDIT_CARD` |
| `PaymentStatus` | `PENDING`, `CONFIRMED`, `FAILED`, `EXPIRED` |
 
Nova categoria = alteração no enum + migration (aceitável: o cardápio muda pouco).
 
---
 
## 3. Tabelas
 
### Usuários e autenticação
 
**User**
| Campo | Observação |
|---|---|
| `id` | |
| `name` | |
| `email` | único |
| `phone` | opcional no cadastro; obrigatório no primeiro checkout |
| `passwordHash` | opcional (quem usa só Google não tem senha) |
| `emailVerifiedAt` | vazio = e-mail não verificado |
| `role` | `Role`, padrão `CUSTOMER` |
| `asaasCustomerId` | opcional, único; criado na primeira compra |
| `isDemo` | dado fictício do seed |
| `createdAt`, `updatedAt` | |
 
**Session**
| Campo | Observação |
|---|---|
| `id` | hash do token de sessão |
| `userId` | |
| `expiresAt` | |
| `createdAt` | |
 
**OAuthAccount**
| Campo | Observação |
|---|---|
| `provider` | ex.: `google` |
| `providerUserId` | id do usuário no provedor |
| `userId` | |
| | único: `provider` + `providerUserId` |
 
**EmailToken**
| Campo | Observação |
|---|---|
| `tokenHash` | único |
| `userId` | |
| `type` | `EmailTokenType` |
| `expiresAt` | |
| `usedAt` | preenchido ao usar (uso único) |
 
### Catálogo e entrega
 
**Product**
| Campo | Observação |
|---|---|
| `id` | |
| `name` | |
| `slug` | único (URL do produto) |
| `description` | |
| `priceInCents` | |
| `imageUrl` | URL do Cloudinary ou imagem local do seed |
| `category` | `ProductCategory` |
| `isActive` | desativar em vez de apagar |
| `createdAt`, `updatedAt` | |
 
**Neighborhood** (bairros atendidos)
| Campo | Observação |
|---|---|
| `id` | |
| `name` | único |
| `deliveryFeeInCents` | |
| `isActive` | |
 
**Address** (endereços salvos do cliente)
| Campo | Observação |
|---|---|
| `id`, `userId` | |
| `cep`, `street`, `number`, `complement` | |
| `neighborhoodName`, `city`, `state` | como vieram do ViaCEP |
| `neighborhoodId` | bairro atendido correspondente (define a taxa) |
| `isDefault` | |
 
### Pedidos e pagamento
 
**Order**
| Campo | Observação |
|---|---|
| `id` | |
| `code` | único e legível, ex.: `DC-000123` |
| `userId` | |
| `status` | `OrderStatus` |
| `fulfillmentType` | `FulfillmentType` |
| `subtotalInCents`, `deliveryFeeInCents`, `totalInCents` | calculados no servidor |
| `customerPhone` | snapshot |
| campos de endereço | snapshot; vazios quando for retirada |
| `isDemo` | |
| `createdAt`, `updatedAt`, `paidAt` | |
 
**OrderItem**
| Campo | Observação |
|---|---|
| `id`, `orderId`, `productId` | |
| `productName` | snapshot |
| `unitPriceInCents` | snapshot |
| `quantity` | |
 
**OrderStatusHistory** (linha do tempo do pedido)
| Campo | Observação |
|---|---|
| `id`, `orderId` | |
| `fromStatus`, `toStatus` | |
| `changedById` | vazio = mudança feita pelo sistema (webhook) |
| `createdAt` | |
 
**Payment** (tentativas de pagamento; um pedido pode ter várias)
| Campo | Observação |
|---|---|
| `id`, `orderId` | |
| `asaasPaymentId` | único |
| `method` | `PaymentMethod` |
| `status` | `PaymentStatus` |
| `amountInCents` | |
| `createdAt`, `updatedAt` | |
 
**WebhookEvent** (idempotência)
| Campo | Observação |
|---|---|
| `id` | |
| `eventId` | único (ID do evento enviado pelo Asaas) |
| `type` | |
| `payload` | JSON |
| `processedAt` | |
 
---
 
## 4. Relacionamentos
 
```
User ─┬─< Session
      ├─< OAuthAccount
      ├─< EmailToken
      ├─< Address >── Neighborhood
      └─< Order ─┬─< OrderItem >── Product
                 ├─< OrderStatusHistory
                 └─< Payment
WebhookEvent (independente)
```
`─<` = um para muitos.
 
---
 
## 5. Dados pessoais
 
- **CPF:** pedido apenas no **primeiro checkout** e enviado direto ao Asaas para criar o cliente. O banco guarda somente o `asaasCustomerId`. Compras seguintes reutilizam esse ID.
- **CPF nunca aparece em logs.**
- **Dados de cartão nunca passam pelo servidor** (padrão PCI). Pagamento com cartão na página do Asaas; Pix pode ser exibido no site via QR Code. Detalhes definidos na etapa de pagamento.
- **Telefone:** salvo no usuário (para preencher automaticamente) e copiado no pedido.
- **Dados de demonstração:** `isDemo` em `User` e `Order`. O `DEMO_ADMIN` só enxerga registros com `isDemo = true`.