# Vitrine de Cupons

Landing responsiva de demonstração para uma loja de cupons e vantagens, em React e Vite.

## Páginas

- Início com banner de promoções rotativas e seleção de cupons.
- Catálogo com cinco exemplos editáveis em `src/products.js`.
- Carrinho persistido apenas no armazenamento local do navegador.
- Prévia de finalização de pedido, sem cobrança, envio de email ou resgate real.
- Formulário de dúvidas que abre o aplicativo de email do visitante quando `VITE_CONTACT_EMAIL` está configurado.
- Páginas de privacidade, cookies e diretrizes, com preferências de cookies.

## Rodar localmente

```bash
npm ci
npm run dev
```

O Vite mostra o endereço local no terminal. Para gerar a versão estática:

```bash
npm run build
npm run preview
```

## Configuração antes de operar uma loja

Os cinco cupons, nomes e valores são somente dados ilustrativos. Edite `src/products.js` com ofertas confirmadas. Configure `VITE_CONTACT_EMAIL` no ambiente da hospedagem para definir o destinatário do formulário de dúvidas.

A finalização atual é apenas uma prévia de interface. Antes de receber pedidos reais, implemente um backend para validar preços e disponibilidade, registrar pedidos, autenticar clientes quando necessário e integrar um provedor de pagamento compatível. Nunca coloque chaves privadas, segredos ou credenciais em variáveis `VITE_*` ou no código do navegador.

Revise também os textos de privacidade e diretrizes para incluir a identificação e os canais oficiais da pessoa ou empresa responsável. A política de cookies desta demonstração informa que o carrinho e as preferências ficam no navegador e não há analytics instalado.

## Publicação no Netlify

O repositório `HigorMra/votinggame2` está conectado ao GitHub. No Netlify, use esse repositório, diretório raiz `/`, comando `npm ci && npm run build` e diretório de publicação `dist`. O arquivo `netlify.toml` define o build, suporte a rotas de página e cabeçalhos de segurança.

Não adicione arquivos `.env` ou dados de clientes ao Git. O `.gitignore` exclui arquivos de ambiente, cache e artefatos de build.
