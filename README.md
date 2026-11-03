<!--# Voto Live

Overlay interativo para TikTok LIVE. O placar só registra uma Rosa depois que a mesma pessoa comenta `ESQUERDA` ou `DIREITA` e envia o presente. Cliques na urna não contam votos.

## Conectar eventos grátis usando TikFinity

O adaptador local recebe eventos do TikFinity Desktop pela Event API em `ws://127.0.0.1:21213/`. Isso tira o Eulerstream e o cookie anônimo `ttwid` do caminho: o TikFinity faz a conexão com a LIVE e o projeto apenas escuta os eventos localmente. A Event API exige que TikFinity Desktop esteja instalado e aberto no mesmo computador; o protocolo é de terceiros e não oficial do TikTok.

1. Abra o TikFinity Desktop, faça o setup e conecte a conta que fará a LIVE. O TikFinity precisa estar conectado à LIVE para enviar eventos. Não compartilhe senha nem cookies no terminal ou no chat.
2. Mantenha o TikFinity Desktop aberto.
3. No PowerShell, nesta pasta, execute:

```powershell
$env:TIKTOK_USERNAME = "seu_usuario_tiktok"
npm run live:local
```

O overlay local abre em `http://127.0.0.1:3001/`; o estado do adaptador aparece em `http://127.0.0.1:3001/health`. Mantenha o terminal e TikFinity Desktop abertos enquanto estiver transmitindo.

No OBS, configure a fonte Navegador para `http://127.0.0.1:3001/?audio=1`. O LIVE Studio recebe a cena via OBS Virtual Camera. O áudio do overlay depende da configuração de áudio do OBS.

Para rodar testes locais, execute `npm test` e `npm run build`. `server/gifts.js` normaliza comandos e presentes; apenas a Rosa finalizada de uma sequência é contabilizada, e só para quem escolheu um lado no chat.

## Adaptador hospedado antigo

`server/index.js` e `render.yaml` permanecem como opção hospedada legada usando `tiktok-live-connector`. Os logs do Render mostraram que a assinatura de eventos dessa integração exige uma rota Business do Eulerstream. Para a alternativa sem esse provedor pago, use `npm run live:local` com TikFinity.-->
