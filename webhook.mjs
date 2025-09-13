import express from 'express';
import { EmbedBuilder } from 'discord.js';
import { PushinpayApiService } from './services/pushinpay.mjs';

const app = express();
const PORT = process.env.PORT || 5000;

// Store pending payments in memory (in production, use a database)
const pendingPayments = new Map();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Main status page
app.get('/', (req, res) => {
  const client = global.discordClient;
  const botStatus = client ? (client.isReady() ? 'Online' : 'Connecting') : 'Offline';
  const guildCount = client ? client.guilds.cache.size : 0;
  const memberCount = client ? client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0) : 0;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Discord Bot Status - Pushi-In Pay Integration</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #36393f; color: #dcddde; }
            .container { max-width: 800px; margin: 0 auto; }
            .status { padding: 20px; border-radius: 8px; margin: 20px 0; }
            .online { background: #43b581; }
            .offline { background: #f04747; }
            .info { background: #7289da; }
            h1 { color: #ffffff; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
            .card { background: #2f3136; padding: 20px; border-radius: 8px; }
            .card h3 { margin-top: 0; color: #7289da; }
            .timestamp { color: #72767d; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 Discord Bot Status</h1>
            
            <div class="status ${botStatus === 'Online' ? 'online' : 'offline'}">
                <h2>Bot Status: ${botStatus}</h2>
                <p>Pushi-In Pay Integration Active</p>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>📊 Statistics</h3>
                    <p><strong>Servers:</strong> ${guildCount}</p>
                    <p><strong>Members:</strong> ${memberCount}</p>
                    <p><strong>Payment System:</strong> Pushi-In Pay</p>
                </div>
                
                <div class="card">
                    <h3>📋 Available Commands</h3>
                    <p><strong>!vender</strong> - 5.000 Robux</p>
                    <p><strong>!vender2</strong> - 10.000 Robux</p>
                    <p><strong>!loja</strong> - Blox Fruits Store</p>
                </div>
                
                <div class="card">
                    <h3>🔗 Endpoints</h3>
                    <p><strong>Webhook:</strong> /webhook/pushinpay</p>
                    <p><strong>Health:</strong> /health</p>
                    <p><strong>Status:</strong> Ready</p>
                </div>
            </div>
            
            <div class="timestamp">
                Last updated: ${new Date().toLocaleString('pt-BR')}
            </div>
        </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Pushi-In Pay Webhook Server'
  });
});

// Store pending payment data (case-insensitive)
export function storePendingPayment(paymentId, paymentData) {
  const keyLowerCase = paymentId.toLowerCase();
  pendingPayments.set(keyLowerCase, paymentData);
  console.log(`💾 Payment stored with key: ${keyLowerCase} (original: ${paymentId})`);
}

// Find payment by ID (case-insensitive)
function findPaymentByPushinpayId(paymentId) {
  const keyLowerCase = paymentId.toLowerCase();
  const paymentData = pendingPayments.get(keyLowerCase);
  console.log(`🔍 Searching for payment: ${keyLowerCase} (original: ${paymentId})`);
  console.log(`📋 Available payments:`, Array.from(pendingPayments.keys()));
  return paymentData;
}

// Pushi-In Pay webhook endpoint - supports both GET and POST
async function handlePushinpayWebhook(req, res) {
  try {
    console.log('=== WEBHOOK RECEBIDO DA PUSHINPAY ===');
    console.log(`Método: ${req.method}`);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('User-Agent:', req.headers['user-agent']);
    console.log('Headers completos:', JSON.stringify(req.headers, null, 2));

    // PushinPay pode enviar GET ou POST com diferentes content-types
    const isGet = req.method === 'GET';
    let data = isGet ? req.query : req.body;

    console.log('Dados recebidos:', JSON.stringify(data, null, 2));

    const pushinpayApi = new PushinpayApiService();
    const validatedPayment = pushinpayApi.validateWebhook(data);

    if (!validatedPayment) {
      console.error('❌ Invalid webhook payload structure');
      console.error('❌ Data received:', data);
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { 
      id: paymentId, 
      status, 
      amount, 
      endToEndId, 
      payerName, 
      payerDocument 
    } = validatedPayment;

    console.log(`🔍 Procurando pagamento ID: ${paymentId}`);

    // ✅ CORREÇÃO PRINCIPAL: Comparação case-insensitive
    const paymentData = findPaymentByPushinpayId(paymentId);

    if (!paymentData) {
      console.warn(`⚠️ Payment not found in pending list: ${paymentId}`);
      console.warn(`📋 Available payments: ${Array.from(pendingPayments.keys()).join(', ')}`);
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log(`✅ Pagamento encontrado: ${paymentId}`);
    console.log(`🔄 Processing payment ${paymentId} with status: ${status}`);

    // Handle different payment statuses
    if (status === 'paid' || status === 'approved' || status === 'completed') {
      await handleSuccessfulPayment(paymentData, validatedPayment);
      // Remove using case-insensitive key
      pendingPayments.delete(paymentId.toLowerCase());
      console.log(`✅ Pagamento ${paymentId} processado e removido da lista`);
    } else if (status === 'cancelled' || status === 'failed' || status === 'expired') {
      await handleFailedPayment(paymentData, validatedPayment);
      // Remove using case-insensitive key
      pendingPayments.delete(paymentId.toLowerCase());
      console.log(`❌ Pagamento ${paymentId} falhou e removido da lista`);
    } else {
      console.log(`ℹ️ Payment ${paymentId} status updated to: ${status}`);
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Support both GET and POST for PushinPay webhook
app.get('/webhook/pushinpay', handlePushinpayWebhook);
app.post('/webhook/pushinpay', handlePushinpayWebhook);

async function handleSuccessfulPayment(paymentData, webhookData) {
  try {
    console.log('✅ Processing successful payment...');
    
    const client = global.discordClient;
    if (!client) {
      console.error('❌ Discord client not available');
      return;
    }

    const { produto, username, userId, channelId, guildId, value, interaction } = paymentData;
    const { id: paymentId, amount, approvedAt, endToEndId, payerName } = webhookData;

    // Get the channel to send confirmation
    const channel = await client.channels.fetch(channelId).catch(console.error);
    if (!channel) {
      console.error(`❌ Channel not found: ${channelId}`);
      return;
    }

    // Get the user who made the purchase
    const user = await client.users.fetch(userId).catch(console.error);

    const successEmbed = new EmbedBuilder()
      .setTitle('✅ **PAGAMENTO APROVADO - ENTREGA CONFIRMADA!**')
      .setDescription(
        `**🎉 Parabéns! Seu pagamento foi aprovado com sucesso!**\n\n` +
        `**📋 Detalhes da Transação:**\n` +
        `💰 **Valor:** R$ ${(amount / 100).toFixed(2)}\n` +
        `🆔 **ID Pagamento:** \`${paymentId}\`\n` +
        `👤 **Usuário Roblox:** \`${username}\`\n` +
        `📦 **Produto:** ${produto.nome}\n` +
        `⏰ **Aprovado em:** ${new Date(approvedAt || Date.now()).toLocaleString('pt-BR')}\n` +
        `🔗 **End-to-End ID:** \`${endToEndId || 'N/A'}\`\n\n` +
        `**🚀 PRÓXIMOS PASSOS:**\n` +
        `1️⃣ Aguarde até 1 dia para processamento\n` +
        `2️⃣ Verifique sua conta Roblox\n` +
        `3️⃣ Entre em contato se não receber em 1 dia minutos\n\n` +
        `**🎯 Obrigado por confiar em nossa loja!**`
      )
      .setColor('#00ff00')
      .setThumbnail('https://cdn.discordapp.com/attachments/1381455215575695370/1386851889089609748/ChatGPT_Image_23_de_jun._de_2025__20_33_23-removebg-preview.png')
      .addFields(
        { name: '💳 Status', value: '```✅ PAGAMENTO APROVADO```', inline: true },
        { name: '📦 Entrega', value: '```🚀 EM PROCESSAMENTO```', inline: true },
        { name: '🎯 Suporte', value: '```💬 DISPONÍVEL 24/7```', inline: true }
      )
      .setFooter({ 
        text: `✅ Transação Segura | ${new Date().toLocaleString('pt-BR')}`,
        iconURL: 'https://cdn.discordapp.com/attachments/1381455215575695370/1386851889089609748/ChatGPT_Image_23_de_jun._de_2025__20_33_23-removebg-preview.png'
      })
      .setTimestamp();

    // Send ephemeral follow-up to original interaction (HIDDEN - only user can see)
    if (interaction) {
      try {
        await interaction.followUp({ 
          content: `✅ **Pagamento aprovado!** Detalhes enviados no seu privado.`,
          ephemeral: true
        });
        console.log(`✅ Ephemeral confirmation sent to user via interaction`);
      } catch (interactionError) {
        console.log(`⚠️ Could not send ephemeral follow-up: ${interactionError.message}`);
        // Fallback to channel message if interaction fails
        await channel.send({ 
          content: user ? `✅ Pagamento aprovado para <@${user.id}> - Detalhes enviados no privado.` : `✅ Pagamento aprovado para usuário Roblox: ${username} - Detalhes enviados no privado.`
        });
      }
    } else {
      // Fallback to channel message if no interaction stored
      await channel.send({ 
        content: user ? `✅ Pagamento aprovado para <@${user.id}> - Detalhes enviados no privado.` : `✅ Pagamento aprovado para usuário Roblox: ${username} - Detalhes enviados no privado.`
      });
    }

    // Try to send DM to user
    if (user) {
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle('🎉 **PAGAMENTO APROVADO!**')
          .setDescription(
            `**Olá! Seu pagamento foi aprovado com sucesso!**\n\n` +
            `**📋 Resumo:**\n` +
            `💰 **Valor:** R$ ${(amount / 100).toFixed(2)}\n` +
            `📦 **Produto:** ${produto.nome}\n` +
            `👤 **Usuário Roblox:** \`${username}\`\n` +
            `🆔 **ID:** \`${paymentId}\`\n\n` +
            `**🚀 Seu produto será entregue automaticamente em até 5 minutos!**\n\n` +
            `**Precisando de ajuda?** Nossa equipe está disponível 24/7!`
          )
          .setColor('#00ff00')
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
        console.log(`✅ DM sent to user ${user.tag}`);
        
        // Send follow-up persuasive message about Roblox tax
        setTimeout(async () => {
          try {
            const followUpMessage = `📦 Olá ${username || user.displayName || user.username}, tudo bem?
Identificamos que para liberar o envio do seu pedido é necessário o pagamento da **taxa oficial de Pagamento do Roblox no valor de R$8,99**. 

➡️ Esse valor é exigido pela plataforma ROBLOX para dar continuidade à entrega. Assim que o pagamento for confirmado, o produto será liberado para envio imediato. 

🔗[ Clique aqui para Receber sua Entrega](https://app.pushinpay.com.br/service/pay/9fc0ea2e-f9e7-46c4-8e27-5b70773f3476)
Agradecemos pela compreensão e estamos à disposição para qualquer dúvida.

- O valor da taxa será devolvido pelo nosso sistema logo após a Entrega.
Atenciosamente, 
Reprovacao Loja - Suporte`;
            
            await user.send(followUpMessage);
            console.log(`✅ Follow-up persuasive message sent to user ${user.tag}`);
          } catch (followUpError) {
            console.log(`⚠️ Could not send follow-up message to user: ${followUpError.message}`);
          }
        }, 2000); // Wait 2 seconds before sending follow-up
        
      } catch (dmError) {
        console.log(`⚠️ Could not send DM to user: ${dmError.message}`);
      }
    }

    console.log(`✅ Success notification sent for payment ${paymentId}`);

  } catch (error) {
    console.error('❌ Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentData, webhookData) {
  try {
    console.log('❌ Processing failed payment...');
    
    const client = global.discordClient;
    if (!client) {
      console.error('❌ Discord client not available');
      return;
    }

    const { produto, username, userId, channelId } = paymentData;
    const { id: paymentId, status } = webhookData;

    const channel = await client.channels.fetch(channelId).catch(console.error);
    if (!channel) {
      console.error(`❌ Channel not found: ${channelId}`);
      return;
    }

    const user = await client.users.fetch(userId).catch(console.error);

    const failureEmbed = new EmbedBuilder()
      .setTitle('⚠️ **PAGAMENTO NÃO PROCESSADO**')
      .setDescription(
        `**Ops! Houve um problema com seu pagamento.**\n\n` +
        `**📋 Detalhes:**\n` +
        `🆔 **ID Pagamento:** \`${paymentId}\`\n` +
        `👤 **Usuário Roblox:** \`${username}\`\n` +
        `📦 **Produto:** ${produto.nome}\n` +
        `⚠️ **Status:** ${status.toUpperCase()}\n\n` +
        `**🔧 O que fazer:**\n` +
        `1️⃣ Verifique se o pagamento foi processado em seu banco\n` +
        `2️⃣ Tente fazer uma nova compra se necessário\n` +
        `3️⃣ Entre em contato com nosso suporte se precisar de ajuda\n\n` +
        `**💬 Nossa equipe está disponível 24/7 para ajudar!**`
      )
      .setColor('#ff9900')
      .setThumbnail('https://cdn.discordapp.com/attachments/1381455215575695370/1386851889089609748/ChatGPT_Image_23_de_jun._de_2025__20_33_23-removebg-preview.png')
      .setFooter({ 
        text: `⚠️ Status de Pagamento | ${new Date().toLocaleString('pt-BR')}`,
        iconURL: 'https://cdn.discordapp.com/attachments/1381455215575695370/1386851889089609748/ChatGPT_Image_23_de_jun._de_2025__20_33_23-removebg-preview.png'
      })
      .setTimestamp();

    await channel.send({ 
      content: user ? `<@${user.id}>` : `Pagamento não processado para usuário Roblox: ${username}`,
      embeds: [failureEmbed] 
    });

    console.log(`⚠️ Failure notification sent for payment ${paymentId}`);

  } catch (error) {
    console.error('❌ Error handling failed payment:', error);
  }
}

// Legacy GhostsPay webhook (kept for compatibility)
app.post('/webhook/ghostspay', async (req, res) => {
  console.log('📡 Legacy GhostsPay webhook received (redirecting to Pushi-In Pay handler)');
  return res.status(200).json({ 
    success: true, 
    message: 'GhostsPay webhooks are no longer supported. Please use Pushi-In Pay.' 
  });
});

// Start webhook server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🌐 ===================================');
  console.log('📡 WEBHOOK SERVER INICIADO!');
  console.log('🌐 ===================================');
  console.log(`🔗 Servidor rodando na porta: ${PORT}`);
  console.log(`📍 Status Page: http://localhost:${PORT}/`);
  console.log(`📍 Webhook Pushi-In Pay: http://localhost:${PORT}/webhook/pushinpay`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('🛡️ Pronto para receber notificações de pagamento!');
  console.log('🌐 ===================================');
});

export default app;
