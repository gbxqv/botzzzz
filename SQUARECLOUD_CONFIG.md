# Configuração para SquareCloud

## 🚀 Como configurar seu bot para funcionar na SquareCloud

### ✅ Correções implementadas:

1. **Comparação case-insensitive de IDs** - Resolve o problema principal dos webhooks
2. **Suporte a GET e POST** - PushinPay pode usar ambos os métodos
3. **Logs detalhados** - Para debug completo do webhook
4. **URLs dinâmicas** - Detecta automaticamente a plataforma de hospedagem
5. **Suporte multi-platform** - Funciona em Replit, SquareCloud e outras

### 🔧 Configuração de Secrets na SquareCloud:

No painel da SquareCloud, adicione estas variáveis de ambiente:

```
BOT_TOKEN=seu_token_do_discord_bot
PUSHINPAY_TOKEN=seu_token_da_pushinpay
SQUARECLOUD_URL=https://seu-dominio.squarecloud.app
```

### 📡 URLs de Webhook automáticas:

O sistema detecta automaticamente a plataforma:

- **SquareCloud**: Usa `SQUARECLOUD_URL/webhook/pushinpay`
- **Replit**: Usa `REPLIT_DOMAINS/webhook/pushinpay` 
- **Manual**: Usa `PAYMENT_WEBHOOK_URL` se definido

### 🐛 Debugging:

Os logs agora mostram:
- Método da requisição (GET/POST)
- Content-Type do webhook
- Dados recebidos completos
- Busca case-insensitive de pagamentos
- Status de cada processamento

### ⚡ Principais correções aplicadas:

1. **Case-insensitive ID matching**: `9FC0DD1C` = `9fc0dd1c`
2. **Suporte form-urlencoded**: PushinPay pode enviar diferentes formatos
3. **Logs completos**: Debug detalhado para identificar problemas
4. **Multi-platform URLs**: Funciona em qualquer hospedagem
5. **Error handling melhorado**: Tratamento robusto de erros

## 🎯 Status atual:
- ✅ Bot conectado ao Discord
- ✅ Webhook server ativo na porta 5000
- ✅ Sistema de pagamento Pushi-In Pay integrado
- ✅ Todas as lojas funcionando (!vender, !vender2, !loja, !lojapet)
- ✅ Webhook otimizado para SquareCloud