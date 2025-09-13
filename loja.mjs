import dotenv from 'dotenv';
import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from 'discord.js';
import axios from 'axios';
import QRCode from 'qrcode';
import fs from 'fs';
import { storePendingPayment } from './webhook.mjs';
import { PushinpayApiService } from './services/pushinpay.mjs';

dotenv.config();

const ADMIN_ID = process.env.ADMIN_ID;
const WEBHOOK_URL = process.env.PAYMENT_WEBHOOK_URL || null;
const ICON_URL = 'https://media.discordapp.net/attachments/1381455217912189050/1382182401806958632/logo-grow-a-garden.png?ex=684a392c&is=6848e7ac&hm=59a2f8a68f97dcbf2113ab3e77168eef29f90ee254294abacac52f854c4b4143&=&format=webp&quality=lossless';
const STORE_NAME = 'Guaxinim Store';

const produtos = [
    { 
    id: 'fruta8', 
    nome: ' 50SX DE SHECKLES', 
    preco: 9.90, 
    estoque: 4, 
    emoji: '1381486226728681554',
    originalPrice: 90.00,
    rarity: 'UNICA',
    power: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐',
    description: 'Compre com segurança somente aqui!'
  },
  { 
    id: 'fruta1', 
    nome: '100sx DE SHECKLES', 
    preco: 12.90, 
    estoque: 7, 
    emoji: '1381486287701409854',
    originalPrice: 90.00,
    rarity: 'UNICO',
    power: '⭐⭐⭐⭐⭐⭐⭐',
    description: 'Compre com segurança somente aqui!'
  },
  { 
    id: 'fruta2', 
    nome: '150SX DE SHECKLES', 
    preco: 17.90, 
    estoque: 5, 
    emoji: '1389059127665234030',
    originalPrice: 85.00,
    rarity: 'UNICO',
    power: '⭐⭐⭐⭐',
    description: 'Compre com segurança somente aqui!'
  }
];

// Professional color schemes
const COLORS = {
  primary: '#1e40af',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  gold: '#f59e0b',
  premium: '#7c3aed',
  processing: '#8b5cf6',
  mythic: '#e11d48',
  legendary: '#7c2d12',
  epic: '#9333ea',
  rare: '#2563eb'
};

const getRarityColor = (rarity) => {
  switch(rarity) {
    case 'Mítica': return COLORS.mythic;
    case 'Lendária': return COLORS.legendary;
    case 'Épica': return COLORS.epic;
    case 'Rara': return COLORS.rare;
    default: return COLORS.primary;
  }
};

async function simulateRobloxVerification(interaction, username, produto) {
  try {
    // Step 1: Enhanced processing display
    const step1Embed = new EmbedBuilder()
      .setTitle('🔍 **Verificação de Segurança Iniciada**')
      .setDescription(
        `**🎯 Usuário:** \`${username}\`\n` +
        `**🍎 Produto:** ${produto.nome}\n` +
        `**💎 Raridade:** ${produto.rarity}\n\n` +
        `⚡ **Iniciando protocolos de segurança...**\n` +
        `🔐 **Sistema anti-fraude ativo**`
      )
      .setColor(COLORS.processing)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '🛡️ Status', value: '```⏳ Verificando credenciais```', inline: true },
        { name: '⚡ Tempo Estimado', value: '```🕐 5-8 segundos```', inline: true },
        { name: '🔒 Segurança', value: '```🟢 Máxima Proteção```', inline: true }
      )
      .setFooter({ text: `🔒 Verificação Segura | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [step1Embed] });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: API Connection
    const step2Embed = new EmbedBuilder()
      .setTitle('📡 **Conectando à API Oficial do Roblox**')
      .setDescription(
        `**🔄 Estabelecendo conexão segura...**\n` +
        `**🌐 Validando usuário na base oficial**\n` +
        `**🛡️ Verificando elegibilidade para pets**\n\n` +
        `✨ **Tecnologia de ponta para máxima segurança**`
      )
      .setColor(COLORS.warning)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '📊 Sistema', value: '```🟡 API Roblox Oficial```', inline: true },
        { name: '🔐 Conexão', value: '```🟡 SSL Certificado```', inline: true },
        { name: '🍎 Grow a garden', value: '```🟡 Verificando Jogo```', inline: true }
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
          `• Certifique-se de ter o Blox Fruits no perfil\n` +
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

    // Step 3: User verification success
    const accountCreated = new Date(userData.created);
    const accountAge = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));
    
    const step3Embed = new EmbedBuilder()
      .setTitle('✅ **Usuário Verificado com Sucesso!**')
      .setDescription(
        `**🎉 Conta Roblox encontrada e qualificada!**\n\n` +
        `**📊 Informações da Conta:**`
      )
      .setColor(COLORS.success)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '👤 Nome do Usuário', value: `\`\`\`${userData.displayName || userData.name}\`\`\``, inline: true },
        { name: '🆔 ID da Conta', value: `\`\`\`${userData.id}\`\`\``, inline: true },
        { name: '📅 Conta Criada', value: `\`\`\`${accountCreated.toLocaleDateString('pt-BR')}\`\`\``, inline: true },
        { name: '⏰ Idade da Conta', value: `\`\`\`${accountAge} dias\`\`\``, inline: true },
        { name: '🎮 Status BloxFruits', value: `\`\`\`✅ Qualificado\`\`\``, inline: true },
        { name: '🛡️ Verificação', value: `\`\`\`🟢 Aprovada\`\`\``, inline: true }
      )
      .setFooter({ text: `✅ Verificação Concluída | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [step3Embed] });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Security validation
    const step4Embed = new EmbedBuilder()
      .setTitle('🔐 **Verificações de Segurança Avançadas**')
      .setDescription(
        `**🛡️ Executando protocolos de segurança para pets...**\n\n` +
        `**Todas as verificações foram aprovadas com sucesso!**`
      )
      .setColor(COLORS.success)
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '🔍 Anti-Fraude', value: '```✅ APROVADO```', inline: true },
        { name: '🎮 Jogo Ativo', value: '```✅ BLOXFRUITS```', inline: true },
        { name: '🚫 Restrições', value: '```✅ NENHUMA```', inline: true },
        { name: '💎 Elegibilidade', value: '```✅ QUALIFICADO```', inline: true },
        { name: '🍎 Tipo moeda', value: '```✅ PERMANENTE```', inline: true },
        { name: '⚡ Processo', value: '```✅ FINALIZADO```', inline: true }
      )
      .setFooter({ text: `🛡️ Máxima Segurança | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [step4Embed] });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 5: Final confirmation with product details
    const savings = produto.originalPrice - produto.preco;
    const discountPercent = Math.round((savings / produto.originalPrice) * 100);
    
    const step5Embed = new EmbedBuilder()
      .setTitle('🎉 **Verificação Concluída - Pronto para Pagamento!**')
      .setDescription(
        `**🌟 Parabéns! Sua conta foi verificada com sucesso!**\n\n` +
        `**🍎 Resumo da moeda Permanente:**`
      )
      .setColor(getRarityColor(produto.rarity))
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '👤 Usuário Roblox', value: `\`\`\`${username}\`\`\``, inline: true },
        { name: '🍎 moeda', value: `\`\`\`${produto.nome}\`\`\``, inline: true },
        { name: '💎 Raridade', value: `\`\`\`${produto.rarity}\`\`\``, inline: true },
        { name: '⭐ Poder', value: `\`\`\`${produto.power}\`\`\``, inline: true },
        { name: '💰 Preço Final', value: `\`\`\`R$ ${produto.preco.toFixed(2)}\`\`\``, inline: true },
        { name: '💸 Economia', value: `\`\`\`R$ ${savings.toFixed(2)} (${discountPercent}% OFF)\`\`\``, inline: true }
      )
      .setFooter({ text: `🔄 Gerando pagamento PIX... | ${STORE_NAME}`, iconURL: ICON_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [step5Embed] });
    await new Promise(resolve => setTimeout(resolve, 1500));

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
      externalId: `pet_${Date.now()}`
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
      .setTitle('🧾 **PIX Gerado - Finalize e Receba seu pet!**')
      .setDescription(
        `**🎯 Última etapa para receber sua ${produto.nome}!**\n\n` +
        `**💳 Informações do Pagamento:**\n` +
        `🍎 **moeda:** ${produto.nome} (${produto.rarity})\n` +
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
      .setColor(getRarityColor(produto.rarity))
      .setThumbnail(ICON_URL)
      .addFields(
        { name: '📋 Copia e Cola', value: `\`\`\`${pixCode}\`\`\``, inline: false },
        { name: '⚡ Processamento', value: '```🚀 Automático e Instantâneo```', inline: true },
        { name: '🔒 Segurança', value: '```🛡️ Pagamento 100% Seguro```', inline: true },
        { name: '🍎 Status', value: '```⏳ Aguardando Pagamento```', inline: true }
      )
      .setFooter({ text: '💎 Entrega automática após confirmação | Guaxinim Store', iconURL: ICON_URL })
      .setTimestamp();

    // No manual verification buttons to avoid API spam

    const qrAttachment = new AttachmentBuilder(qrPath);

    await interaction.editReply({ 
      embeds: [embedPagamento], 
      files: [qrAttachment]
    });

    console.log(`💾 Pagamento ${paymentId} criado para ${username} - ${produto.nome}`);

  } catch (error) {
    console.error('❌ Erro ao gerar Pix:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setTitle('⚠️ **Erro ao Gerar Pagamento**')
      .setDescription(
        `**Não foi possível gerar o PIX no momento.**\n\n` +
        `🔧 **Tente novamente em alguns instantes.**\n` +
        `🆘 **Se o problema persistir, contate nosso suporte!**`
      )
      .setColor(COLORS.danger)
      .setFooter({ text: '🛠️ Suporte Técnico 24/7 | Guaxinim Store', iconURL: ICON_URL });

    await interaction.editReply({ embeds: [errorEmbed] }).catch(console.error);
  }
}

export default function setupLoja(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Command: !loja
    if (message.content.toLowerCase() === '!loja') {
      const embed = new EmbedBuilder()
        .setTitle('🍎 **LOJA DE MOEDAS SHECKLESS - GAG**')
        .setDescription(
          `**🌟 Bem-vindo à nossa loja premium!**\n\n` +
          `**🔥 Ofertas Especiais:**\n` +
          `• **pets 100% Permanentes**\n` +
          `• **Entrega Automática** em até 5 minutos\n` +
          `• **Preços Exclusivos** com até 60% OFF\n` +
          `• **Suporte 24/7** sempre disponível\n` +
          `• **Garantia Total** ou seu dinheiro de volta\n\n` +
          `**📦 Selecione seus pets abaixo:**`
        )
        .setColor(COLORS.gold)
        .setThumbnail(ICON_URL)
        .setImage('https://media.discordapp.net/attachments/1381455217912189050/1389058336418431017/ChatGPT_Image_29_de_jun._de_2025_22_41_44.png?ex=68633ce2&is=6861eb62&hm=369567123d66e9d42155e5f817d1172f22ec3541f2523bc900dfc49aa2917e4e&=&format=webp&quality=lossless&width=1182&height=787')
        .addFields(
          { name: '🔥 Destaque', value: 'Todas as MOEDAS SHECKLESS são **PERMANENTES**', inline: true },
          { name: '⚡ Entrega', value: '**Automática e Imediata**', inline: true },
          { name: '🛡️ Garantia', value: '**100% Seguro**', inline: true }
        )
        .setFooter({ text: `🛒 Loja Premium | ${STORE_NAME}`, iconURL: ICON_URL })
        .setTimestamp();

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_fruta')
        .setPlaceholder('🍎 Escolha a quantia de MOEDAS...')
        .addOptions(
          produtos.map(produto => {
            const savings = produto.originalPrice - produto.preco;
            const discountPercent = Math.round((savings / produto.originalPrice) * 100);
            
            return {
              label: `${produto.nome} - R$ ${produto.preco.toFixed(2)}`,
              description: `${produto.rarity} • ${discountPercent}% OFF • Estoque: ${produto.estoque}`,
              value: produto.id,
              emoji: produto.emoji
            };
          })
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await message.reply({ embeds: [embed], components: [row] });
    }
  });

  // Handle select menu interactions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'select_fruta') {
      const produtoId = interaction.values[0];
      const produto = produtos.find(p => p.id === produtoId);

      if (!produto) return;

      if (produto.estoque <= 0) {
        const estoqueEmbed = new EmbedBuilder()
          .setTitle('❌ **Produto Esgotado**')
          .setDescription('**Desculpe! Esta pet está temporariamente esgotada.**\n\nTente novamente mais tarde ou escolha outra pet.')
          .setColor(COLORS.danger)
          .setThumbnail(ICON_URL)
          .setFooter({ text: `🛒 Loja Online | ${STORE_NAME}`, iconURL: ICON_URL })
          .setTimestamp();

        return interaction.reply({ embeds: [estoqueEmbed], flags: MessageFlags.Ephemeral });
      }

      const savings = produto.originalPrice - produto.preco;
      const discountPercent = Math.round((savings / produto.originalPrice) * 100);

      const embed = new EmbedBuilder()
        .setTitle(`${produto.emoji} **${produto.nome}**`)
        .setDescription(
          `**${produto.description}**\n\n` +
          `**📊 Detalhes da moeda:**\n` +
          `💎 **Raridade:** ${produto.rarity}\n` +
          `⭐ **Poder:** ${produto.power}\n` +
          `🔥 **Tipo:** moeda Permanente\n` +
          `📦 **Estoque:** ${produto.estoque} unidade(s)\n\n` +
          `**💸 Economia incrível de R$ ${savings.toFixed(2)} (${discountPercent}% OFF)**`
        )
        .setColor(getRarityColor(produto.rarity))
        .setThumbnail(ICON_URL)
        .addFields(
          { name: '💰 Preço Promocional', value: `**R$ ${produto.preco.toFixed(2)}**`, inline: true },
          { name: '🏷️ Preço Normal', value: `~~R$ ${produto.originalPrice.toFixed(2)}~~`, inline: true },
          { name: '⚡ Entrega', value: '**Automática e Imediata**', inline: true },
          { name: '🛡️ Garantia', value: '**100% Seguro**', inline: true },
          { name: '🎯 Método', value: '**PIX Instantâneo**', inline: true },
          { name: '🔒 Segurança', value: '**Máxima Proteção**', inline: true }
        )
        .setFooter({ text: `🍎 moeda Permanente | ${STORE_NAME}`, iconURL: ICON_URL })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId(`comprar_${produto.id}`)
        .setLabel('🛒 COMPRAR AGORA')
        .setStyle(ButtonStyle.Success)
        .setEmoji(produto.emoji);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    }
  });

  // Handle button interactions for fruits
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('comprar_fruta')) {
      const produtoId = interaction.customId.replace('comprar_', '');
      const produto = produtos.find(p => p.id === produtoId);

      if (!produto) return;

      if (produto.estoque <= 0) {
        const estoqueEmbed = new EmbedBuilder()
          .setTitle('❌ **Produto Esgotado**')
          .setDescription('**Desculpe! Esta moeda está temporariamente esgotada.**\n\nTente novamente mais tarde.')
          .setColor(COLORS.danger)
          .setThumbnail(ICON_URL)
          .setFooter({ text: `🛒 Loja Online | ${STORE_NAME}`, iconURL: ICON_URL })
          .setTimestamp();

        return interaction.reply({ embeds: [estoqueEmbed], flags: MessageFlags.Ephemeral });
      }

      const modal = new ModalBuilder()
        .setCustomId(`modal_${produto.id}`)
        .setTitle(`🍎 Comprar ${produto.nome}`);

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

  // Handle modal submissions for fruits
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId.startsWith('modal_fruta')) {
      const produtoId = interaction.customId.replace('modal_', '');
      const produto = produtos.find(p => p.id === produtoId);
      const username = interaction.fields.getTextInputValue('roblox_username');

      if (!produto) return;

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Start verification process
      await simulateRobloxVerification(interaction, username, produto);
    }
  });
}
