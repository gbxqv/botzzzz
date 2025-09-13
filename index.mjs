import dotenv from 'dotenv';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import fs from 'fs';

dotenv.config();

const ADMIN_ID = process.env.ADMIN_ID;

// Create qrcodes directory if it doesn't exist
if (!fs.existsSync('./qrcodes')) {
  fs.mkdirSync('./qrcodes');
}

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

// Enhanced error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // Log additional context for debugging
  console.error('🔍 Stack trace:', reason?.stack || 'No stack trace available');
});

// Enhanced error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  console.error('🔍 Stack trace:', error?.stack || 'No stack trace available');
  // Graceful shutdown on critical errors
  process.exit(1);
});

// Import command modules and webhook server
const setupBot = await import('./bot.mjs');
const setupLoja = await import('./loja.mjs');
const setupLojaRobux = await import('./lojarobux.mjs');
const setupLojaPet = await import('./lojapet.mjs');
const webhookApp = await import('./webhook.mjs');

// Initialize command handlers
setupBot.default(client);
setupLojaRobux.default(client);
setupLoja.default(client);
setupLojaPet.default(client);

// Store client globally for webhook access
global.discordClient = client;

client.once('ready', () => {
  console.log('🎉 ===================================');
  console.log('🤖 DISCORD BOT INICIADO COM SUCESSO!');
  console.log('🎉 ===================================');
  console.log(`✅ Bot online como: ${client.user.tag}`);
  console.log(`🔧 Admin ID configurado: ${ADMIN_ID}`);
  console.log(`📡 Bot está em ${client.guilds.cache.size} servidor(es)`);
  console.log(`👥 Membros alcançados: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`);
  console.log('🎯 ===================================');
  console.log('📋 COMANDOS DISPONÍVEIS:');
  console.log('🎮 !vender   - Oferta 5.000 Robux');
  console.log('👑 !vender2  - Oferta 10.000 Robux');
  console.log('🍎 !loja     - Loja de Frutas Permanentes');
  console.log('🐾 !lojapet  - Loja de Pets Permanentes');
  console.log('🎯 ===================================');
  console.log('💳 SISTEMA DE PAGAMENTO: Pushi-In Pay API');
  console.log('📡 WEBHOOK: Configurado e ativo');
  console.log('🎯 ===================================');
  
  // Set professional bot activity
  client.user.setActivity('PARCEIRO GROW A GARDEN OFICIAL!', { 
    type: ActivityType.Custom 
  });
  
  // Set bot status
  client.user.setStatus('online');
});

// Enhanced global error handler for Discord client
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
  console.error('🔍 Error details:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
});

// Handle disconnections
client.on('disconnect', () => {
  console.warn('⚠️ Bot desconectado do Discord');
});

// Handle reconnections
client.on('reconnecting', () => {
  console.log('🔄 Bot tentando reconectar...');
});

// Handle rate limits
client.on('rateLimit', (rateLimitInfo) => {
  console.warn('⏱️ Rate limit atingido:', {
    timeout: rateLimitInfo.timeout,
    limit: rateLimitInfo.limit,
    method: rateLimitInfo.method,
    path: rateLimitInfo.path,
    route: rateLimitInfo.route
  });
});

// Enhanced logging for debug purposes
client.on('debug', (info) => {
  // Only log important debug information to avoid spam
  if (info.includes('Heartbeat') || info.includes('Latency')) {
    return; // Skip heartbeat spam
  }
  console.log('🔍 Debug:', info);
});

// Handle warnings
client.on('warn', (warning) => {
  console.warn('⚠️ Discord warning:', warning);
});

// Graceful shutdown handler
process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT, desligando bot graciosamente...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM, desligando bot graciosamente...');
  client.destroy();
  process.exit(0);
});

// Start the bot
console.log('🚀 Iniciando bot Discord...');
console.log('⏳ Conectando à API do Discord...');
console.log('💳 Integrando sistema Pushi-In Pay...');

try {
  await client.login(process.env.BOT_TOKEN);
} catch (loginError) {
  console.error('❌ Erro ao fazer login no Discord:', loginError);
  console.error('🔍 Verifique se o BOT_TOKEN está correto no arquivo .env');
  process.exit(1);
}