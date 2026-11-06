import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleHelp, Cookie, Gift, Heart, Home, Mail, Menu, Minus, Plus, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, Star, Ticket, Truck, X } from 'lucide-react'
import { products } from './products.js'

const promos = [
  { eyebrow: 'CAMPANHA DA TEMPORADA', title: 'Black Friday: ofertas em destaque.', text: 'Veja os itens cadastrados para a campanha.', cta: 'VER BLACK FRIDAY', to: '/black-friday', tone: 'promo-peach', icon: Gift },
  { eyebrow: 'PRESENTES DE NATAL', title: 'Encontre uma ideia para presentear.', text: 'Explore a seleção de demonstração para a temporada de Natal.', cta: 'VER NATAL', to: '/natal', tone: 'promo-blue', icon: Sparkles },
  { eyebrow: 'CUPONS E VANTAGENS', title: 'Uma vitrine para descobrir.', text: 'Explore cupons de exemplo e monte sua seleção em poucos cliques.', cta: 'VER CUPONS', to: '/cupons', tone: 'promo-lilac', icon: Ticket },
]
const routeNames = { '/': 'Início', '/natal': 'Natal', '/black-friday': 'Black Friday', '/cupons': 'Cupons', '/carrinho': 'Carrinho', '/faq': 'Dúvidas', '/privacidade': 'Privacidade', '/cookies': 'Cookies', '/diretrizes': 'Diretrizes' }
const CART_KEY = 'vitrine-demo-cart-v1'
const CONSENT_KEY = 'vitrine-cookie-preferences-v1'
const safeRead = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const readCart = () => {
  const value = safeRead(CART_KEY, [])
  if (!Array.isArray(value)) return []
  return value.filter((item) => item && products.some((product) => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 10)
}
const formatPoints = (value) => `${new Intl.NumberFormat('pt-BR').format(value)} pts`

function navigate(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function Link({ to, children, className = '', onClick, ...props }) {
  return <a href={to} className={className} onClick={(event) => { onClick?.(event); if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(to) }} {...props}>{children}</a>
}

function Icon({ name, size = 23 }) {
  const icons = { ticket: Ticket, truck: Truck, sparkles: Sparkles, gift: Gift, star: Star }
  const Component = icons[name] || Gift
  return <Component size={size} strokeWidth={1.65} aria-hidden="true" />
}

function Header({ route, count, setCookieOpen }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className="site-header"><div className="header-inner">
    <Link to="/" className="wordmark" aria-label="Vitrine, início"><span className="brand-mark"><Sparkles size={19}/></span><span>vitrine<span className="brand-period">.</span></span></Link>
    <nav className={menuOpen ? 'main-nav nav-open' : 'main-nav'} aria-label="Navegação principal">
      {['/', '/cupons', '/faq'].map((path) => <Link key={path} to={path} className={route === path ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>{routeNames[path]}</Link>)}
    </nav>
    <div className="header-actions"><button className="icon-button cookie-shortcut" onClick={setCookieOpen} aria-label="Preferências de cookies"><Cookie size={19}/></button><Link to="/carrinho" className={route === '/carrinho' ? 'cart-link active' : 'cart-link'} aria-label={`Carrinho com ${count} itens`}><ShoppingBag size={19}/><span>Carrinho</span><b className="cart-count">{count}</b></Link><button className="icon-button mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button></div>
  </div></header>
}

function CategorySidebar({ route }) {
  const categories = [
    { path: '/natal', label: 'Natal', icon: Gift },
    { path: '/black-friday', label: 'Black Friday', icon: Sparkles },
    { path: '/cupons', label: 'Cupons', icon: Ticket },
  ]
  return <aside className="category-sidebar"><span className="sidebar-kicker">LOJA</span><h2>Departamentos</h2><nav aria-label="Categorias de produtos">{categories.map(({ path, label, icon: CategoryIcon }) => <Link key={path} to={path} aria-current={route === path ? 'page' : undefined} className={route === path ? 'category-link selected' : 'category-link'}><CategoryIcon size={18}/><span>{label}</span><ArrowRight size={14} className="category-arrow"/></Link>)}</nav><div className="sidebar-note"><span>✳</span><div><b>OFERTAS DA TEMPORADA</b><small>Consulte a página para ver a seleção atual.</small></div></div></aside>
}

function ProductCard({ product, addToCart, inCart }) {
  return <article className="product-card"><div className={`product-art art-${product.tone}`}><span className="product-badge">{product.badge}</span><div className="art-decoration art-circle-one"/><div className="art-decoration art-circle-two"/><span className="coupon-cut coupon-cut-left"/><span className="coupon-cut coupon-cut-right"/><div className="art-icon"><Icon name={product.icon} size={31}/></div><span className="art-code">VANTAGEM · {String(product.id.length * 7).padStart(2, '0')}</span></div><div className="product-info"><div className="product-category">CUPOM DE DEMONSTRAÇÃO</div><h3>{product.name}</h3><p>{product.detail}</p><div className="product-bottom"><div><strong>{formatPoints(product.points)}</strong><small>valor ilustrativo</small></div><button className={inCart ? 'add-button added' : 'add-button'} onClick={() => addToCart(product.id)} aria-label={`Adicionar ${product.name} ao carrinho`}>{inCart ? <><Check size={16}/> ADICIONADO</> : <><Plus size={17}/> ADICIONAR</>}</button></div></div></article>
}

function ProductGrid({ list, addToCart, cart }) { return <div className="product-grid">{list.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} inCart={cart.some((item) => item.id === product.id)}/>)}</div> }

function PromoHero({ active, setActive }) {
  const promo = promos[active]
  const PromoIcon = promo.icon
  return <section className={`promo-hero ${promo.tone}`} aria-label="Promoções"><div className="promo-copy"><div className="eyebrow"><span className="eyebrow-star">✳</span>{promo.eyebrow}</div><h1>{promo.title}</h1><p>{promo.text}</p><Link to={promo.to} className="primary-button">{promo.cta}<ArrowRight size={17}/></Link><div className="promo-controls"><button onClick={() => setActive((active + promos.length - 1) % promos.length)} aria-label="Promoção anterior"><ArrowLeft size={17}/></button><div className="promo-dots" aria-label={`Promoção ${active + 1} de ${promos.length}`}>{promos.map((item, index) => <button key={item.title} onClick={() => setActive(index)} className={index === active ? 'promo-dot selected' : 'promo-dot'} aria-label={`Mostrar promoção ${index + 1}`}/>)}</div><button onClick={() => setActive((active + 1) % promos.length)} aria-label="Próxima promoção"><ArrowRight size={17}/></button></div></div><div className="promo-visual"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-note note-one"><span>✳</span> boas escolhas</div><div className="visual-note note-two"><Heart size={15} fill="currentColor"/> feito para você</div><div className="promo-sticker"><PromoIcon size={40}/><span>DESCUBRA</span><strong>novas<br/>vantagens</strong><i>✳</i></div><div className="visual-sparkle sparkle-one">✦</div><div className="visual-sparkle sparkle-two">✳</div></div><div className="hero-side-note">VITRINE DE VANTAGENS <span>•</span> {String(active + 1).padStart(2, '0')} / 03</div></section>
}

function TrustStrip() { return <div className="trust-strip"><div><span className="trust-icon"><ShieldCheck size={18}/></span><span><b>ESCOLHA TRANQUILA</b><small>Revise antes de continuar</small></span></div><div><span className="trust-icon"><Ticket size={18}/></span><span><b>OFERTAS EM UM SÓ LUGAR</b><small>Encontre sua próxima vantagem</small></span></div><div><span className="trust-icon"><Heart size={18}/></span><span><b>FEITO PARA VOCÊ</b><small>Uma experiência simples e leve</small></span></div></div> }

function HomePage({ addToCart, cart }) {
  const [active, setActive] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => setActive((index) => (index + 1) % promos.length), 5000); return () => window.clearInterval(timer) }, [])
  return <><PromoHero active={active} setActive={setActive}/><main className="page-shell home-content"><TrustStrip/><section className="section-block"><div className="section-heading"><div><span className="section-overline">OFERTAS EM DESTAQUE</span><h2>Uma seleção para descobrir.</h2><p>Veja uma prévia das ofertas cadastradas.</p></div><Link to="/black-friday" className="text-link">VER BLACK FRIDAY <ArrowRight size={16}/></Link></div><ProductGrid list={products.slice(0, 3)} addToCart={addToCart} cart={cart}/></section><section className="callout"><div className="callout-icon"><Gift size={23}/></div><div><span>ESCOLHA, REVISE, CONTINUE</span><h2>Encontre sua próxima vantagem.</h2></div><Link to="/cupons" className="secondary-button">EXPLORAR CUPONS <ArrowRight size={16}/></Link></section></main></>
}

function PageHeading({ eyebrow, title, description, back = '/' }) { return <div className="page-heading"><Link to={back} className="back-link"><ArrowLeft size={15}/> VOLTAR</Link><span className="section-overline">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div> }

function CouponsPage({ addToCart, cart }) { return <main className="page-shell subpage"><PageHeading eyebrow="ESCOLHA A SUA PRÓXIMA VANTAGEM" title="Cupons para descobrir." description="Explore a vitrine e adicione ao carrinho os benefícios que chamarem sua atenção."/><div className="catalog-note"><Sparkles size={17}/><span><b>VITRINE DE EXEMPLO</b> Os cinco cupons e valores abaixo são demonstrativos e podem ser editados em <code>src/products.js</code>.</span></div><ProductGrid list={products} addToCart={addToCart} cart={cart}/><p className="demo-footnote">Os exemplos ainda não representam ofertas ou códigos de resgate ativos.</p></main> }

function CampaignPage({ campaign, addToCart, cart }) {
  const isBlackFriday = campaign === 'black-friday'
  const title = isBlackFriday ? 'Black Friday.' : 'Natal.'
  const label = isBlackFriday ? 'BLACK FRIDAY' : 'NATAL'
  const list = products.filter((product) => product.categories?.includes(campaign))
  return <main className="page-shell subpage campaign-page"><PageHeading eyebrow={label} title={title} description={isBlackFriday ? 'Todos os produtos cadastrados nesta loja e marcados para a campanha Black Friday.' : 'Produtos cadastrados para a temporada de Natal.'}/><div className="campaign-banner"><span className="campaign-mark">✳</span><div><b>{isBlackFriday ? 'OFERTAS DE BLACK FRIDAY' : 'SELEÇÃO DE NATAL'}</b><p>Catálogo de demonstração · {list.length} {list.length === 1 ? 'produto' : 'produtos'} cadastrados</p></div><span className="campaign-tag">{isBlackFriday ? 'TEMPORADA 2026' : 'FESTAS 2026'}</span></div><ProductGrid list={list} addToCart={addToCart} cart={cart}/><p className="demo-footnote">Os itens, preços em pontos e descontos são exemplos ilustrativos. Configure produtos, preços reais e links da Kiwify antes de divulgar ou aceitar pedidos.</p></main>
}

function CartPage({ cart, setCart }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [message, setMessage] = useState('')
  const entries = cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product)
  const subtotal = entries.reduce((sum, item) => sum + item.product.points * item.quantity, 0)
  const setQuantity = (id, quantity) => setCart((items) => quantity < 1 ? items.filter((item) => item.id !== id) : items.map((item) => item.id === id ? { ...item, quantity: Math.min(quantity, 10) } : item))
  const finishDemo = (event) => { event.preventDefault(); if (!entries.length) return; const reference = `VT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; setMessage(`Prévia concluída (${reference}). Nenhuma compra ou solicitação real foi enviada. Configure um serviço de pedidos e resgates para ativar esta etapa.`); setCart([]); setCheckoutOpen(false); setForm({ name: '', email: '' }) }
  return <main className="page-shell subpage"><PageHeading eyebrow="SUA SELEÇÃO" title="Carrinho." description="Confira sua seleção antes de seguir." back="/cupons"/>{message && <div className="success-message" role="status"><Check size={19}/><span>{message}</span></div>}<div className="cart-layout"><section className="cart-items" aria-label="Itens no carrinho">{entries.length ? entries.map(({ id, quantity, product }) => <article className="cart-item" key={id}><div className={`cart-thumb art-${product.tone}`}><Icon name={product.icon} size={24}/></div><div className="cart-item-info"><span className="product-category">CUPOM DE DEMONSTRAÇÃO</span><h2>{product.name}</h2><p>{formatPoints(product.points)} por unidade</p></div><div className="quantity-control"><button aria-label={`Remover uma unidade de ${product.name}`} onClick={() => setQuantity(id, quantity - 1)}><Minus size={14}/></button><span>{quantity}</span><button aria-label={`Adicionar uma unidade de ${product.name}`} onClick={() => setQuantity(id, quantity + 1)} disabled={quantity >= 10}><Plus size={14}/></button></div><strong className="line-total">{formatPoints(product.points * quantity)}</strong><button className="remove-item" onClick={() => setQuantity(id, 0)} aria-label={`Remover ${product.name}`}><X size={17}/></button></article>) : <div className="empty-cart"><span className="empty-cart-icon"><ShoppingCart size={27}/></span><h2>Seu carrinho está vazio.</h2><p>Explore os cupons de demonstração e escolha os seus favoritos.</p><Link to="/cupons" className="primary-button">VER CUPONS <ArrowRight size={16}/></Link></div>}</section><aside className="order-summary"><span className="section-overline">RESUMO DA SELEÇÃO</span><h2>Seu pedido</h2><div className="summary-line"><span>Itens</span><span>{entries.reduce((sum, item) => sum + item.quantity, 0)}</span></div><div className="summary-line"><span>Total ilustrativo</span><b>{formatPoints(subtotal)}</b></div><div className="summary-rule"/><p>Esta vitrine é uma demonstração. Pontos não são cobrados e os cupons ainda não são resgatáveis.</p><button className="primary-button summary-continue" disabled={!entries.length} onClick={() => { setMessage(''); setCheckoutOpen(true) }}>CONTINUAR <ArrowRight size={16}/></button><Link to="/cupons" className="continue-shopping">Continuar escolhendo</Link></aside></div>{checkoutOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false) }}><section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><button className="modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Fechar"><X size={20}/></button><span className="section-overline">PRÉVIA DA FINALIZAÇÃO</span><h2 id="checkout-title">Quase lá.</h2><p>Confira como será a etapa de contato quando a loja estiver conectada ao serviço de pedidos.</p><form onSubmit={finishDemo}><label>Nome<input autoComplete="name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome"/></label><label>Email<input autoComplete="email" required type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@exemplo.com"/></label><div className="demo-disclaimer"><ShieldCheck size={18}/><span>Não haverá cobrança, envio de email nem resgate real. Os dados deste formulário são usados somente nesta prévia e não são salvos.</span></div><button className="primary-button" type="submit">VER PRÉVIA DO PEDIDO <ArrowRight size={16}/></button></form></section></div>}</main>
}

function FAQPage() {
  const [form, setForm] = useState({ subject: '', message: '' })
  const [notice, setNotice] = useState('')
  const contact = import.meta.env.VITE_CONTACT_EMAIL || ''
  const sendQuestion = (event) => {
    event.preventDefault()
    if (!contact) {
      setNotice('O email de atendimento ainda não foi configurado. Defina VITE_CONTACT_EMAIL no ambiente do site para ativar o envio. A mensagem continua somente neste formulário.')
      return
    }
    const params = new URLSearchParams({ subject: form.subject || 'Dúvida sobre a Vitrine', body: form.message })
    window.location.href = 'mailto:' + encodeURIComponent(contact) + '?' + params.toString()
  }
  return <main className="page-shell subpage"><PageHeading eyebrow="FALE COM A GENTE" title="Dúvidas?" description="Envie sua pergunta. O canal será ativado quando o email de atendimento for configurado."/><section className="faq-layout"><div className="faq-aside"><div className="faq-icon"><CircleHelp size={27}/></div><h2>Estamos preparando o atendimento.</h2><p>Deixe sua dúvida no formulário. Quando um email for configurado, ele abrirá sua ferramenta de email para você enviar a mensagem.</p><div className="faq-email-state"><Mail size={17}/><span>{contact || 'EMAIL DE ATENDIMENTO PENDENTE'}</span></div></div><form className="faq-form" onSubmit={sendQuestion}><label>Assunto<input maxLength={120} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Sobre o que é sua dúvida?" required/></label><label>Sua mensagem<textarea maxLength={4000} rows={7} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Escreva sua pergunta aqui…" required/></label><div className="form-bottom"><span>{form.message.length}/4000</span><button className="primary-button" type="submit">{contact ? 'ABRIR EMAIL' : 'PREPARAR ENVIO'} <ArrowRight size={16}/></button></div>{notice && <p className="inline-notice" role="status">{notice}</p>}<p className="form-privacy">{contact ? 'Seu aplicativo de email será aberto; a página não transmite nem armazena a mensagem.' : 'A mensagem permanece somente neste formulário enquanto o endereço de atendimento estiver pendente.'}</p></form></section></main>
}

function CookiePreferences({ close }) {
  const [analytics, setAnalytics] = useState(false)
  const save = (allowAnalytics = analytics) => { try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics: Boolean(allowAnalytics), savedAt: new Date().toISOString() })) } catch {} close() }
  return <div className="modal-backdrop cookie-backdrop"><section className="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-title"><div className="cookie-symbol"><Cookie size={23}/></div><span className="section-overline">SUA PRIVACIDADE</span><h2 id="cookie-title">Você escolhe como usamos cookies.</h2><p>Cookies essenciais mantêm o carrinho e suas preferências funcionando neste navegador. Nesta versão não usamos cookies de publicidade nem ferramentas de análise.</p><div className="cookie-option"><div><b>Essenciais</b><small>Necessários para o carrinho e a navegação.</small></div><span className="always-on"><Check size={14}/> SEMPRE ATIVOS</span></div><div className="cookie-option"><div><b>Análise</b><small>Preferência registrada; nenhuma ferramenta de análise está instalada.</small></div><button type="button" role="switch" aria-checked={analytics} className={analytics ? 'switch on' : 'switch'} onClick={() => setAnalytics((value) => !value)} aria-label="Ativar ou desativar cookies de análise"><span/></button></div><div className="cookie-links"><Link to="/privacidade" onClick={close}>Privacidade</Link><Link to="/cookies" onClick={close}>Cookies</Link><Link to="/diretrizes" onClick={close}>Diretrizes</Link></div><div className="cookie-actions"><button className="secondary-button" onClick={() => save()}>SALVAR ESCOLHAS</button><button className="primary-button" onClick={() => save(false)}>CONTINUAR COM ESSENCIAIS <ArrowRight size={15}/></button></div></section></div>
}

const legalContent = {
  '/privacidade': { eyebrow: 'INFORMAÇÕES DO SITE', title: 'Privacidade.', description: 'Uma explicação simples sobre os dados usados nesta demonstração.', sections: [['O que guardamos', 'O carrinho e sua escolha de cookies podem ser salvos no armazenamento local do seu navegador. Não são enviados para um servidor nesta versão.'], ['Formulário de finalização', 'Os campos da prévia servem somente para demonstrar a experiência. Eles não são transmitidos nem mantidos após fechar a página.'], ['Atendimento por email', 'O formulário de dúvidas abre o aplicativo de email do visitante quando houver um endereço de atendimento configurado. Sem endereço, a página informa que o canal ainda está pendente.'], ['Responsável pelo site', 'Preencha aqui o nome ou razão social, o canal de contato e as informações do responsável antes da publicação comercial.']] },
  '/cookies': { eyebrow: 'PREFERÊNCIAS DO NAVEGADOR', title: 'Política de cookies.', description: 'Quais informações ficam guardadas neste navegador.', sections: [['Essenciais', 'Usamos armazenamento local para manter o carrinho e registrar a preferência de cookies. Esses dados ficam neste navegador.'], ['Análise e publicidade', 'Esta cópia não inclui ferramentas de análise, pixels de anúncios ou cookies de publicidade. A opção de análise permanece desativada.'], ['Gerenciar ou apagar', 'Você pode apagar os dados do site nas configurações do navegador. Também pode reabrir as preferências pelo ícone de cookie no topo da página.']] },
  '/diretrizes': { eyebrow: 'COMO USAR ESTA VITRINE', title: 'Diretrizes.', description: 'Informações para uma experiência clara e segura.', sections: [['Ofertas de exemplo', 'Os cinco itens, pontos e descrições desta versão são ilustrativos. Eles não garantem descontos, produtos, disponibilidade ou resgate.'], ['Compras e pagamentos', 'Não há cobrança, processamento de pagamento ou emissão de cupom habilitados nesta versão. A etapa de finalização é uma prévia local.'], ['Publicação comercial', 'Antes de iniciar vendas ou resgates, configure ofertas reais, regras, validade, atendimento, política de troca e o processamento seguro no servidor.']] },
}

function LegalPage({ route }) { const content = legalContent[route]; return <main className="page-shell subpage legal-page"><PageHeading eyebrow={content.eyebrow} title={content.title} description={content.description}/><div className="legal-card">{content.sections.map(([title, text]) => <section key={title}><span className="legal-icon"><ShieldCheck size={18}/></span><div><h2>{title}</h2><p>{text}</p></div></section>)}</div><Link to="/faq" className="text-link legal-help">Ficou com alguma dúvida? Fale com a gente <ArrowRight size={16}/></Link></main> }

function Footer({ setCookieOpen }) { return <footer className="site-footer"><div className="footer-main"><div><Link to="/" className="wordmark"><span className="brand-mark"><Sparkles size={18}/></span><span>vitrine<span className="brand-period">.</span></span></Link><p>Uma experiência de demonstração para descobrir novas vantagens.</p></div><div className="footer-links"><div><b>EXPLORE</b><Link to="/cupons">Cupons</Link><Link to="/carrinho">Carrinho</Link><Link to="/faq">Dúvidas</Link></div><div><b>INFORMAÇÕES</b><Link to="/diretrizes">Diretrizes</Link><Link to="/privacidade">Privacidade</Link><Link to="/cookies">Cookies</Link><button onClick={setCookieOpen}>Preferências de cookies</button></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} VITRINE · DEMONSTRAÇÃO</span><span>OFERTAS E RESGATES AINDA NÃO ESTÃO ATIVOS</span></div></footer> }

export default function App() {
  const [route, setRoute] = useState(window.location.pathname.replace(/\/$/, '') || '/')
  const [cart, setCart] = useState(readCart)
  const [cookieOpen, setCookieOpen] = useState(() => safeRead(CONSENT_KEY, null)?.essential !== true)
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  useEffect(() => { const update = () => setRoute(window.location.pathname.replace(/\/$/, '') || '/'); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update) }, [])
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch {} }, [cart])
  useEffect(() => { if (cookieOpen) { const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; const closeOnEscape = (event) => event.key === 'Escape' && setCookieOpen(false); window.addEventListener('keydown', closeOnEscape); return () => { document.body.style.overflow = old; window.removeEventListener('keydown', closeOnEscape) } } }, [cookieOpen])
  const addToCart = (id) => setCart((items) => { const item = items.find((entry) => entry.id === id); return item ? items.map((entry) => entry.id === id ? { ...entry, quantity: Math.min(entry.quantity + 1, 10) } : entry) : [...items, { id, quantity: 1 }] })
  const page = route === '/' ? <HomePage addToCart={addToCart} cart={cart}/> : route === '/black-friday' ? <CampaignPage campaign="black-friday" addToCart={addToCart} cart={cart}/> : route === '/natal' ? <CampaignPage campaign="natal" addToCart={addToCart} cart={cart}/> : route === '/cupons' ? <CouponsPage addToCart={addToCart} cart={cart}/> : route === '/carrinho' ? <CartPage cart={cart} setCart={setCart}/> : route === '/faq' ? <FAQPage/> : legalContent[route] ? <LegalPage route={route}/> : <main className="page-shell not-found"><span className="section-overline">404 · PÁGINA NÃO ENCONTRADA</span><h1>Este caminho não existe.</h1><Link to="/" className="primary-button">VOLTAR AO INÍCIO <Home size={16}/></Link></main>
  useEffect(() => { document.title = `${routeNames[route] || 'Página não encontrada'} · Vitrine` }, [route])
  return <><Header route={route} count={cartCount} setCookieOpen={() => setCookieOpen(true)}/><div className="store-layout"><CategorySidebar route={route}/><div className="store-page">{page}</div></div><Footer setCookieOpen={() => setCookieOpen(true)}/>{cookieOpen && <CookiePreferences close={() => setCookieOpen(false)}/>}</>
}
