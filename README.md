# Vitrine de Natal 2026

Landing page responsiva para catálogo de produtos, construída com React e Vite.

## Editar produtos e anúncios

Os dados dos produtos ficam em `src/products.js`. Para editar um anúncio, altere o objeto correspondente nessa lista:

- `name`, `detail` e `description`: título e textos exibidos no catálogo e na página de detalhes.
- `image` e `images`: caminhos das fotos usadas no cartão e na galeria.
- `specs`, `care`, `included`, `composition` e `notes`: informações detalhadas opcionais.
- `price`: preço numérico em reais, ou `null` enquanto não definido.
- `purchaseUrl`: link público do anúncio/checkout, vazio enquanto não definido.
- `category` e `tags`: organização dos filtros e páginas.

Coloque os arquivos de imagem em `public/products` e referencie-os, por exemplo, como `/products/arvore-frente.png`. Assim o catálogo não depende de URLs de imagem de terceiros.

## Páginas e recursos

- Home com campanha sazonal, navegação por categoria e catálogo em destaque.
- Catálogo e páginas individuais de produto com galeria, descrição e especificações.
- Seletor de cor do pisca-pisca, variação 110 V e preço de R$ 24,99.
- Favoritos e carrinho guardados localmente no navegador.
- Página de carrinho informativa. Compra e pagamento só ficam ativos após configurar preço e integrar um checkout real.
- Formulário de dúvidas que prepara um email quando `VITE_CONTACT_EMAIL` estiver configurado.
- Páginas de privacidade, cookies e diretrizes.

## Rodar localmente

```bash
npm ci
npm run dev
```

Para gerar a versão estática:

```bash
npm run build
npm run preview
```

## Antes de vender

Confirme preço, estoque, composição, entrega, política de troca, identificação do vendedor e link de compra. A lista da cesta tem 16 linhas, incluindo caixa e filme plástico; confirme se são 14 itens mais 2 materiais de embalagem antes de publicar. A loja não processa pagamentos nesta versão.

Configure `VITE_CONTACT_EMAIL` no ambiente da hospedagem se quiser abrir o aplicativo de email do visitante pelo formulário de dúvidas. Não coloque chaves privadas, segredos ou credenciais em variáveis `VITE_*` ou no código do navegador.

## Publicação no Netlify

O repositório `HigorMra/votinggame2` pode ser conectado ao Netlify com diretório raiz `/`, comando `npm ci && npm run build` e diretório de publicação `dist`. O arquivo `netlify.toml` define o build, as rotas e cabeçalhos de segurança.

Não adicione arquivos `.env` ou dados de clientes ao Git. O `.gitignore` exclui arquivos de ambiente, cache e artefatos de build.
