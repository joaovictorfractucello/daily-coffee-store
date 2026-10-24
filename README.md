# Daily Coffee

Landing page de uma cafeteria fictícia, feita como **projeto de portfólio** por João Victor. Ela também serve de demonstração para apresentar a donos de cafeterias reais o tipo de site que posso entregar.

O objetivo da página é simples: o visitante conhece o café, vê os produtos mais pedidos e **chama no WhatsApp ou vai até o local**.

> Todos os dados (nome, endereço, telefone, preços, cardápio) são fictícios. O endereço usa uma rua real só para o mapa funcionar.

## O que tem na página

- **Hero** com três fotos que se alternam em transição suave; o botão principal troca de cor junto com a foto
- **Mais pedidos**: 5 produtos em faixa deslizante no celular e em grade no desktop
- **Faixa promocional** com o combo da casa
- **Quem somos**, com três diferenciais ilustrados
- **Localização**: endereço, horários, mapa do Google e botão "Como chegar"
- **Chamada final** para o WhatsApp
- Cardápio completo em PDF, botão fixo de WhatsApp no celular e menu lateral animado

## Decisões de design e desempenho

- Mobile-first, em português do Brasil
- Uma cor de destaque (marrom café), um único tema, sem sombras nem efeitos decorativos
- Respeita `prefers-reduced-motion`; sem JavaScript, o conteúdo continua visível
- Imagens em WebP otimizadas pelo `next/image`; o mapa só carrega depois do restante da página
- Animações só em `opacity` e `transform`, para o scroll ficar fluido no celular

## Tecnologias

[Next.js 16](https://nextjs.org) (App Router) · [React 19](https://react.dev) · TypeScript · [Tailwind CSS 4](https://tailwindcss.com) · [Motion](https://motion.dev) · [Phosphor Icons](https://phosphoricons.com)

## Como rodar

Precisa de [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` | gera a versão de produção |
| `npm run start` | serve a versão de produção (rode o `build` antes) |
| `npm run lint` | verifica o código |

Para abrir no celular pela rede local, use o IP do computador (ex.: `http://192.168.0.10:3000`). Os endereços `192.168.*.*` e `10.*.*.*` já estão liberados em `next.config.ts`.

## Estrutura

```
app/            layout, página, fontes e estilos globais (cores em app/globals.css)
components/     cabeçalho, rodapé, botão fixo, animações e as seções (components/secoes)
data/           textos e produtos
lib/            registro de imagens, links, formatação e mapa
public/         fotos, marca e cardapio.pdf
site.config.ts  dados do negócio (nome, endereço, horários, WhatsApp, Instagram)
```

## Feito por

[João Victor Fractucello](https://github.com/joaovictorfractucello/) · sites para cafeterias e pequenos negócios.
