# ADR 008 — Imagens no Cloudinary com URL no banco

- **Status:** Aceita (implementação na Etapa 7)
- **Data:** 2026-11-12
- **Origem:** SPEC §3 e §11

## Contexto

O admin precisa enviar fotos de produtos. A Vercel não guarda arquivos enviados (o disco das funções é temporário), e salvar imagem dentro do banco é pesado.

## Decisão

Upload no **Cloudinary**, com a assinatura gerada pelo nosso servidor (a chave secreta nunca vai para o front-end). O banco guarda só a URL (`imageUrl`). As imagens iniciais do seed ficam no próprio projeto.

## Alternativas consideradas

- **Imagem no banco (bytes):** um lugar só, mas banco maior, consultas mais lentas e sem otimização de imagem.
- **Vercel Blob ou S3:** funcionam, mas o Cloudinary tem plano gratuito generoso e já entrega redimensionamento e formatos modernos.
- **Upload direto sem assinatura:** mais simples, mas qualquer pessoa poderia enviar arquivos para a conta.

## Consequências

- **Ganha:** armazenamento e otimização de imagem sem custo; banco leve.
- **Perde:** dependência de mais um serviço externo; desativar ou trocar a foto de um produto não apaga a imagem antiga do Cloudinary (limpeza é tarefa à parte).
