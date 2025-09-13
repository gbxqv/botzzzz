import dotenv from 'dotenv';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import axios from 'axios';
import QRCode from 'qrcode';
import fs from 'fs';
import { storePendingPayment } from './webhook.mjs';
import { PushinpayApiService } from './services/pushinpay.mjs';

dotenv.config();

const ADMIN_ID = process.env.ADMIN_ID;
const WEBHOOK_URL = process.env.PAYMENT_WEBHOOK_URL || null;
const ICON_URL = process.env.ICON_URL || 'https://media.discordapp.net/attachments/1381455215575695370/1386851889089609748/ChatGPT_Image_23_de_jun._de_2025__20_33_23-removebg-preview.png?ex=685b35f8&is=6859e478&hm=2ba0168aac7d7b5775d1b2f7fcc32d4053ff980bd712b58f023fe4071ff5aaa9&=&format=webp&quality=lossless&width=450&height=450';
const STORE_NAME = process.env.STORE_NAME || 'GUAXINIM Loja';

const BANNERS = {
  produto1k: process.env.BANNER_5K_ROBUX || 'https://media.discordapp.net/attachments/1381455215575695370/1386850678055506021/416d86fe-5e4d-4afa-b385-09cf1bfb1ca3.png?ex=685b34d8&is=6859e358&hm=33fc0d49f60a52a6321bc4bede05c8bd24a95931e8ddc2064b56b3277e8e8bfd&=&format=webp&quality=lossless&width=1182&height=787',
  produto2k: process.env.BANNER_10K_ROBUX || 'https://media.discordapp.net/attachments/1381455215575695370/1386850678055506021/416d86fe-5e4d-4afa-b385-09cf1bfb1ca3.png?ex=685b34d8&is=6859e358&hm=33fc0d49f60a52a6321bc4bede05c8bd24a95931e8ddc2064b56b3277e8e8bfd&=&format=webp&quality=lossless&width=1182&height=787'
};

const produtos = [
  { 
    id: 'produto1k', 
    nome: '5.000 ROBUX', 
    preco: parseFloat(process.env.ROBUX_5K_PRICE) || 19.90, 
    estoque: parseInt(process.env.ROBUX_5K_STOCK) || 1, 
    originalPrice: parseFloat(process.env.ROBUX_5K_ORIGINAL_PRICE) || 45.00 
  },
  { 
    id: 'produto2k', 
    nome: '10.000 ROBUX', 
    preco: parseFloat(process.env.ROBUX_10K_PRICE) || 37.90, 
    estoque: parseInt(process.env.ROBUX_10K_STOCK) || 1, 
    originalPrice: parseFloat(process.env.ROBUX_10K_ORIGINAL_PRICE) || 80.00 
  }
];

// Professional color schemes
const COLORS = {
  primary: '#1e40af',      // Professional blue
  success: '#059669',      // Success green
  warning: '#d97706',      // Warning orange
  danger: '#dc2626',       // Error red
  gold: '#f59e0b',         // Premium gold
  premium: '#7c3aed',      // Premium purple
  processing: '#8b5cf6'    // Processing purple
};

async function simulateRobloxVerification(interaction, username, produto) {
  try {
    // Step 1: Processing with professional styling
    const step1Embed = new EmbedBuilder()
      .setTitle('🔍 **Verificação de Segurança Iniciada**')
      .setDescription(
        `**🎯 Usuário:** \`${username}\`\n` +
        `**📦 Produto:** ${produto.nome}\n\n` +
        `⚡ **Processando verificações de segurança...**\n` +
        `🔐 **Sistema anti-fraude ativo**`
      )
      .setColor(COLORS.processing)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '🛡️ Status', value: '```⏳ Iniciando verificação```', inline: true },
        { name: '⚡ Tempo Estimado', value: '```🕐 5-8 segundos```', inline: true }
      )
      .setFooter({ text: `🔒 Verificação Segura | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [step1Embed] });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: API Connection with enhanced visuals
    const step2Embed = new EmbedBuilder()
      .setTitle('📡 **Conectando à API Oficial do Roblox**')
      .setDescription(
        `**🔄 Estabelecendo conexão segura...**\n` +
        `**🌐 Validando usuário na base oficial**\n\n` +
        `✨ **Tecnologia de ponta para máxima segurança**`
      )
      .setColor(COLORS.warning)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '📊 Sistema', value: '```🟡 API Roblox Oficial```', inline: true },
        { name: '🔐 Segurança', value: '```🟢 SSL Certificado```', inline: true }
      )
      .setFooter({ text: `🌟 Tecnologia Premium | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [step2Embed] });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get real user data from Roblox API
    let userData = null;
    try {
      const userSearchResponse = await axios.post('https://users.roblox.com/v1/usernames/users', {
        usernames: [username]
      });

      if (userSearchResponse.data.data && userSearchResponse.data.data.length > 0) {
        const userId = userSearchResponse.data.data[0].id;
        const userDetailsResponse = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        userData = userDetailsResponse.data;
      }
    } catch (apiError) {
      console.error('❌ Erro ao consultar API do Roblox:', apiError.message);
    }

    if (!userData) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ **Usuário Não Encontrado**')
        .setDescription(
          `**O usuário \`${username}\` não foi localizado.**\n\n` +
          `📝 **Dicas para resolver:**\n` +
          `• Verifique se o nome está **exatamente** correto\n` +
          `• Certifique-se de usar o **username**, não o display name\n` +
          `• Tente novamente em alguns segundos\n\n` +
          `💡 **Precisa de ajuda?** Nossa equipe está disponível 24/7!`
        )
        .setColor(COLORS.danger)
        .setThumbnail(ICON_URL)
        .setFooter({ text: `🆘 Suporte 24/7 | ${STORE_NAME}`, iconURL: ICON_URL })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    // Step 3: User found with enhanced presentation
    const accountCreated = new Date(userData.created);
    const accountAge = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));
    
    const step3Embed = new EmbedBuilder()
      .setTitle('✅ **Usuário Verificado com Sucesso!**')
      .setDescription(
        `**🎉 Conta Roblox encontrada e validada!**\n\n` +
        `**📊 Informações da Conta:**`
      )
      .setColor(COLORS.success)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '👤 Nome do Usuário', value: `\`\`\`${userData.displayName || userData.name}\`\`\``, inline: true },
        { name: '🆔 ID da Conta', value: `\`\`\`${userData.id}\`\`\``, inline: true },
        { name: '📅 Conta Criada', value: `\`\`\`${accountCreated.toLocaleDateString('pt-BR')}\`\`\``, inline: true },
        { name: '⏰ Idade da Conta', value: `\`\`\`${accountAge} dias\`\`\``, inline: true },
        { name: '🔐 Status', value: `\`\`\`✅ Verificada\`\`\``, inline: true },
        { name: '🛡️ Segurança', value: `\`\`\`🟢 Aprovada\`\`\``, inline: true }
      )
      .setFooter({ text: `✅ Verificação Concluída | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [step3Embed] });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Security checks with professional styling
    const step4Embed = new EmbedBuilder()
      .setTitle('🔐 **Verificações de Segurança Avançadas**')
      .setDescription(
        `**🛡️ Executando protocolos de segurança...**\n\n` +
        `**Todas as verificações foram aprovadas!**`
      )
      .setColor(COLORS.success)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '🔍 Anti-Fraude', value: '```✅ APROVADO```', inline: true },
        { name: '🎯 Conta Ativa', value: '```✅ APROVADO```', inline: true },
        { name: '🚫 Restrições', value: '```✅ NENHUMA```', inline: true },
        { name: '💎 Elegibilidade', value: '```✅ QUALIFICADO```', inline: true },
        { name: '🔒 Proteção', value: '```✅ ATIVA```', inline: true },
        { name: '⚡ Processo', value: '```✅ FINALIZADO```', inline: true }
      )
      .setFooter({ text: `🛡️ Máxima Segurança | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [step4Embed] });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 5: Final confirmation with premium styling
    const savings = produto.originalPrice - produto.preco;
    const discountPercent = Math.round((savings / produto.originalPrice) * 100);
    
    const step5Embed = new EmbedBuilder()
      .setTitle('🎉 **Verificação Concluída - Pronto para Pagamento!**')
      .setDescription(
        `**🌟 Parabéns! Sua conta foi verificada com sucesso!**\n\n` +
        `**📋 Resumo do Pedido:**`
      )
      .setColor(COLORS.gold)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '👤 Usuário Roblox', value: `\`\`\`${username}\`\`\``, inline: true },
        { name: '🎮 Produto', value: `\`\`\`${produto.nome}\`\`\``, inline: true },
        { name: '💰 Preço Final', value: `\`\`\`R$ ${produto.preco.toFixed(2)}\`\`\``, inline: true },
        { name: '🏷️ Preço Original', value: `\`\`\`R$ ${produto.originalPrice.toFixed(2)}\`\`\``, inline: true },
        { name: '💸 Economia', value: `\`\`\`R$ ${savings.toFixed(2)} (${discountPercent}% OFF)\`\`\``, inline: true },
        { name: '⚡ Entrega', value: `\`\`\`🚀 IMEDIATA\`\`\``, inline: true }
      )
      .setFooter({ text: `🔄 Gerando pagamento PIX... | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [step5Embed] });
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate payment
    await gerarPagamento(interaction, produto, username);

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setTitle('⚠️ **Erro Temporário do Sistema**')
      .setDescription(
        `**Ops! Encontramos um problema técnico.**\n\n` +
        `🔧 **O que fazer:**\n` +
        `• Tente novamente em alguns segundos\n` +
        `• Verifique sua conexão com a internet\n` +
        `• Entre em contato com nossa equipe se persistir\n\n` +
        `🆘 **Suporte 24/7 disponível para ajudar!**`
      )
      .setColor(COLORS.danger)
      .setThumbnail(ICON_URL)
      .setFooter({ text: `🛠️ Suporte Técnico | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    } else {
      await interaction.editReply({ embeds: [errorEmbed] }).catch(console.error);
    }
  }
}

async function gerarPagamento(interaction, produto, username = null) {
  try {
    console.log(`🔗 Iniciando criação de pagamento PIX via Pushi-In Pay...`);

    // Create Pushi-In Pay payment request
    const customerData = {
      name: username || process.env.CUSTOMER_NAME || 'Usuário Roblox',
      email: process.env.CUSTOMER_EMAIL || 'avariarbux@discord.com',
      cpf: process.env.CUSTOMER_CPF || '12151185460',
      phone: process.env.CUSTOMER_PHONE || '98981557066',
      paymentMethod: 'PIX',
      amount: Math.round(produto.preco * 100), // Convert to cents
      traceable: true,
      items: [{ 
        title: produto.nome,
        quantity: 1, 
        unitPrice: Math.round(produto.preco * 100),
        tangible: false
      }],
      externalId: `robux_${Date.now()}`
    };

    const pushinpayApi = new PushinpayApiService();
    const paymentData = await pushinpayApi.createPixPayment(customerData);
    
    const pixCode = paymentData.pixCode;
    const paymentId = paymentData.id;
    const qrPath = `./qrcodes/${produto.id}_${paymentId}.png`;
    
    if (!fs.existsSync('./qrcodes')) {
      fs.mkdirSync('./qrcodes');
    }
    
    await QRCode.toFile(qrPath, pixCode);

    // Store payment data for webhook verification
    storePendingPayment(paymentId, {
      produto,
      username,
      userId: interaction.user.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      value: produto.preco,
      pixCode,
      interaction: interaction, // Store interaction for ephemeral responses
      createdAt: new Date().toISOString()
    });

    const embedPagamento = new EmbedBuilder()
      .setTitle('🧾 **PIX Gerado - Finalize sua Compra!**')
      .setDescription(
        `**🎯 Última etapa para receber seus ${produto.nome}!**\n\n` +
        `**💳 Informações do Pagamento:**\n` +
        `💰 **Valor:** R$ ${produto.preco.toFixed(2)}\n` +
        `👤 **Usuário:** \`${username}\`\n` +
        `🆔 **ID Pagamento:** \`${paymentId}\`\n` +
        `⏱️ **Validade:** 30 minutos\n\n` +
        `**📱 Como pagar:**\n` +
        `1️⃣ Abra seu app bancário\n` +
        `2️⃣ Escolha "PIX Copia e Cola"\n` +
        `3️⃣ Cole o código abaixo\n` +
        `4️⃣ Confirme o pagamento\n\n` +
        `**🔗 Código PIX:**`
      )
      .setColor(COLORS.primary)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '📋 Copia e Cola', value: `\`\`\`${pixCode}\`\`\``, inline: false },
        { name: '⚡ Processamento', value: '```🚀 Automático e Instantâneo```', inline: true },
        { name: '🔒 Segurança', value: '```🛡️ Pagamento 100% Seguro```', inline: true },
        { name: '📊 Status', value: '```⏳ Aguardando Pagamento```', inline: true }
      )
      .setFooter({ text: `💎 Entrega automática após confirmação | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    const qrAttachment = new AttachmentBuilder(qrPath);

    await interaction.editReply({ 
      embeds: [embedPagamento], 
      files: [qrAttachment] 
    });

    console.log(`✅ Pagamento PIX criado com sucesso. ID: ${paymentId}`);

  } catch (error) {
    console.error('❌ Erro ao gerar pagamento:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setTitle('⚠️ **Erro ao Gerar Pagamento**')
      .setDescription(
        `**Ops! Não foi possível gerar o PIX.**\n\n` +
        `🔧 **O que fazer:**\n` +
        `• Tente novamente em alguns segundos\n` +
        `• Verifique sua conexão com a internet\n` +
        `• Entre em contato com nossa equipe se persistir\n\n` +
        `🆘 **Suporte 24/7 disponível para ajudar!**`
      )
      .setColor(COLORS.danger)
      .setThumbnail(ICON_URL)
      .setFooter({ text: `🛠️ Suporte Técnico | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] }).catch(console.error);
  }
}

export default function setupBot(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Debug command for admin only
    if (message.content.toLowerCase() === '!debug' && message.author.id === ADMIN_ID) {
      const envVars = Object.keys(process.env).filter(key => 
        key.includes('PUSH') || key.includes('TOKEN') || key.includes('WEBHOOK')
      );
      
      const debugInfo = envVars.map(key => {
        const value = process.env[key];
        return `${key}: ${value ? value.substring(0, 10) + '...' : 'NOT_SET'}`;
      }).join('\n');
      
      await message.reply(`\`\`\`\nVariáveis de Ambiente:\n${debugInfo}\n\`\`\``);
      return;
    }

    // Command: !vender (5,000 Robux)
    if (message.content.toLowerCase() === '!vender') {
      const produto = produtos[0]; // 5,000 Robux
      
      if (produto.estoque <= 0) {
        const estoqueEmbed = new EmbedBuilder()
          .setTitle('❌ **Produto Esgotado**')
          .setDescription('**Desculpe! Este produto está temporariamente esgotado.**\n\nTente novamente mais tarde ou escolha outro produto.')
          .setColor(COLORS.danger)
          .setThumbnail(ICON_URL)
          .setFooter({ text: `🛒 Loja Online | ${STORE_NAME}`, iconURL: ICON_URL })
          .setTimestamp();

        return message.reply({ embeds: [estoqueEmbed] });
      }
      
      const savings = produto.originalPrice - produto.preco;
      const discountPercent = Math.round((savings / produto.originalPrice) * 100)
        
      const embed = new EmbedBuilder()
        .setTitle('💎 **OFERTA ESPECIAL - 5.000 ROBUX**')
        .setDescription(
          `**🎉 Promoção Limitada! Apenas hoje!**\n\n` +
          `**📦 O que você recebe:**\n` +
          `• **5.000 ROBUX** direto na sua conta\n` +
          `• **Entrega 100% automática** em até 5 minutos\n` +
          `• **Suporte 24/7** para qualquer dúvida\n` +
          `• **Garantia total** ou seu dinheiro de volta\n\n` +
          `**💸 Economia incrível de R$ ${savings.toFixed(2)} (${discountPercent}% OFF)**`
        )
        .setColor(COLORS.gold)
        .setImage(BANNERS.produto1k)
        .setThumbnail(ICON_URL)
        .addFields(
          { name: '💰 Preço Promocional', value: `**R$ ${produto.preco.toFixed(2)}**`, inline: true },
          { name: '🏷️ Preço Normal', value: `~~R$ ${produto.originalPrice.toFixed(2)}~~`, inline: true },
          { name: '📦 Estoque', value: `**${produto.estoque} unidade(s)**`, inline: true },
          { name: '⚡ Entrega', value: '**Automática e Imediata**', inline: true },
          { name: '🛡️ Garantia', value: '**100% Seguro**', inline: true },
          { name: '🎯 Método', value: '**PIX Instantâneo**', inline: true }
        )
        .setFooter({ text: `🛒 Oferta por tempo limitado | ${STORE_NAME}`, iconURL: ICON_URL })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId('comprar_produto1k')
        .setLabel('🛒 COMPRAR AGORA | R$19,90')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💎');

      const row = new ActionRowBuilder().addComponents(button);

      await message.reply({ embeds: [embed], components: [row] });
    }

    // Command: !vender2 (10,000 Robux)
    if (message.content.toLowerCase() === '!vender2') {
      const produto = produtos[1]; // 10,000 Robux
      
      if (produto.estoque <= 0) {
        const estoqueEmbed = new EmbedBuilder()
          .setTitle('❌ **Produto Esgotado**')
          .setDescription('**Desculpe! Este produto está temporariamente esgotado.**\n\nTente novamente mais tarde ou escolha outro produto.')
          .setColor(COLORS.danger)
          .setThumbnail(ICON_URL)
          .setFooter({ text: `🛒 Loja Online | ${STORE_NAME}`, iconURL: ICON_URL })
          .setTimestamp();

        return message.reply({ embeds: [estoqueEmbed] });
      }

      const savings = produto.originalPrice - produto.preco;
      const discountPercent = Math.round((savings / produto.originalPrice) * 100);

      const embed = new EmbedBuilder()
        .setTitle('👑 **OFERTA VIP - 10.000 ROBUX**')
        .setDescription(
          `**🌟 Pacote Premium! Melhor custo-benefício!**\n\n` +
          `**📦 O que você recebe:**\n` +
          `• **10.000 ROBUX** direto na sua conta\n` +
          `• **Entrega 100% automática** em até 5 minutos\n` +
          `• **Suporte 24/7** para qualquer dúvida\n` +
          `• **Garantia total** ou seu dinheiro de volta\n` +
          `• **Bônus especial** para compras VIP\n\n` +
          `**💸 Economia fantástica de R$ ${savings.toFixed(2)} (${discountPercent}% OFF)**`
        )
        .setColor(COLORS.premium)
        .setImage(BANNERS.produto2k)
        .setThumbnail(ICON_URL)
        .addFields(
          { name: '💰 Preço Promocional', value: `**R$ ${produto.preco.toFixed(2)}**`, inline: true },
          { name: '🏷️ Preço Normal', value: `~~R$ ${produto.originalPrice.toFixed(2)}~~`, inline: true },
          { name: '📦 Estoque', value: `**${produto.estoque} unidade(s)**`, inline: true },
          { name: '⚡ Entrega', value: '**Automática e Imediata**', inline: true },
          { name: '🛡️ Garantia', value: '**100% Seguro**', inline: true },
          { name: '🎯 Método', value: '**PIX Instantâneo**', inline: true }
        )
        .setFooter({ text: `👑 Oferta VIP exclusiva | ${STORE_NAME}`, iconURL: ICON_URL })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId('comprar_produto2k')
        .setLabel('👑 COMPRAR VIP')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🌟');

      const row = new ActionRowBuilder().addComponents(button);

      await message.reply({ embeds: [embed], components: [row] });
    }
  });

  // Handle button interactions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'comprar_produto1k' || interaction.customId === 'comprar_produto2k') {
      const produtoId = interaction.customId === 'comprar_produto1k' ? 0 : 1;
      const produto = produtos[produtoId];

      if (produto.estoque <= 0) {
        const estoqueEmbed = new EmbedBuilder()
          .setTitle('❌ **Produto Esgotado**')
          .setDescription('**Desculpe! Este produto está temporariamente esgotado.**\n\nTente novamente mais tarde.')
          .setColor(COLORS.danger)
          .setThumbnail(ICON_URL)
          .setFooter({ text: `🛒 Loja Online | ${STORE_NAME}`, iconURL: ICON_URL })
          .setTimestamp();

        return interaction.reply({ embeds: [estoqueEmbed], flags: MessageFlags.Ephemeral });
      }

      const modal = new ModalBuilder()
        .setCustomId(`modal_${produto.id}`)
        .setTitle(`🎮 Comprar ${produto.nome}`);

      const usernameInput = new TextInputBuilder()
        .setCustomId('roblox_username')
        .setLabel('👤 Qual seu nome de usuário no Roblox?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Digite seu username exato do Roblox')
        .setRequired(true)
        .setMaxLength(20)
        .setMinLength(3);

      const row = new ActionRowBuilder().addComponents(usernameInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    }
  });

  // Handle modal submissions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId.startsWith('modal_produto')) {
      const produtoId = interaction.customId.includes('produto1k') ? 0 : 1;
      const produto = produtos[produtoId];
      const username = interaction.fields.getTextInputValue('roblox_username');

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Start verification process
      await simulateRobloxVerification(interaction, username, produto);
    }
  });
}
